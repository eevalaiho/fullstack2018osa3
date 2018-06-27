const mongoose = require('mongoose')
var Schema = mongoose.Schema;

if ( process.env.NODE_ENV !== 'production' ) {
    require('dotenv').config()
}
const url = process.env.MONGODB_URI

console.log(url)

mongoose.connect(url)

const personSchema = new Schema({ name: String, number: String });

personSchema.statics.format = function(person) {
    return {
        name: person.name,
        number: person.number,
        id: person._id
    }
}

const Person = mongoose.model('Person', personSchema)

module.exports = Person
