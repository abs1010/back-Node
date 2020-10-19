const express = require('express');

const app = express();
const { uuid, isUuid } = require('uuidv4')

app.use(express.json());//Set json as the standard format for express

const projects = [];

/**
* Query Params - Filtros e paginacao
* Route Params - Identificar recursos (update/delete)
* Request Body: Conteúdo na hora de criar ou editar um recurso
*/

//Middleware

function logRequests(request, response, next) { 

    const { method, url } = request;

    const logLabel = `[${method.toUpperCase()}] ${url}]`

    console.log(logLabel);

    return next();

}

function validateProjectId(request, response, next) { 

    const { id } = request.params;

    if (!isUuid(id)) { 
        return response.status(400).json({ error: 'Invalid project ID.'});
    }

    return next();

}

//Applies Middleware to all request
app.use(logRequests);
//Applies to all request starting with the provided resource /projects:id
app.use('/projects/:id', validateProjectId);

///GET request
app.get('/projects', (request, response) => {
    const { title } = request.query;

    const results = title
        ? projects.filter(project => project.title.includes(title))
        : projects;

    return response.json(results);
 })

 ///POST request
app.post('/projects', (request, response) => {

    const { title, owner } = request.body;

    const project = { id: uuid(), title, owner }

    projects.push(project);

    return response.json(project);
});

///PUT request
app.put('/projects/:id', (request, response) => {

    const { id } = request.params;
    const { title, owner } = request.body;

    //Return the position in the array, if not found, -1.
    const projectIndex = projects.findIndex(project => project.id === id);

    console.log(projectIndex)
    
    if (projectIndex < 0) { 
        return response.status(400).json({ error: 'Project not found.'});
    }

    ///Creates an object
    const project = {
        id,
        title,
        owner
    };

    ///Replaces the object over the previous position in the array
    projects[projectIndex] = project

    return response.status(200).json(project);
})

///DELETE request
app.delete('/projects/:id', (request, response) => {

    const { id } = request.params;

    //Return the position in the array, if not found, -1.
    const projectIndex = projects.findIndex(project => project.id === id);

    if (projectIndex < 0) { 
        return response.status(400).json({ error: 'Project not found.'});
    }

    projects.splice(projectIndex, 1);
    return response.status(204).send();
})

app.listen(3333, () => { 
    console.log(' 👀 Back-end started');
});