const express = require('express')
const app = express()
app.use(express.static('build'))

const cors = require('cors')
app.use(cors())

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const morgan = require('morgan')
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(
    morgan(function (tokens, req, res) {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens['body'](req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms'
        ].join(' ')
    })
)

const Person = require('./models/person')

app.get('/info', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.send('<p>Puhelinluettelossa ' + persons.length + ' henkilön tiedot</p>' + new Date().toUTCString())
    })
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => {
            response.json(persons.map(Person.format))
        })
        .catch(error => {
            console.log(error)
        })
})

app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => {
            response.json(Person.format(person))
        })
        .catch(error => {
            console.log(error)
        })
})

app.post('/api/persons', (request, response) => {
    if (request.body.name === undefined | request.body.number === undefined) {
        return response.status(400).json({error: 'name or number missing'})
    }

    Person.find({name: request.body.name}, function (err, persons) {
        if (persons.length) {
            response
                .status(400)
                .json({error: 'Name must be unique'})
        } else {
            const person = new Person({
                name: request.body.name,
                number: request.body.number
            })
            person
                .save()
                .then(savedPerson => {
                    response.json(Person.format(savedPerson))
                })
                .catch(error => {
                    console.log(error)
                })
        }
    })
})


app.put('/api/persons/:id', (request, response) => {
    const person = {
        name: request.body.name,
        number: request.body.number
    }
    Person
        .findByIdAndUpdate(request.params.id, person, { new: true })
        .then(savedPerson => {
            response.json(Person.format(savedPerson))
        })
        .catch(error => {
            response.json({error: error})
            console.log(error)
        })
})

app.delete('/api/persons/:id', (request, response) => {
    Person
        .remove({ _id: request.params.id})
        .exec()
        .catch(error => {
            console.log(error)
        })
    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
