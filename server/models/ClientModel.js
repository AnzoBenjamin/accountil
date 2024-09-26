import express from 'express'
import mongoose, { Collection } from 'mongoose'

const ClientSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    userId: [String],
    createdAt: {
        type: Date,
        default: new Date()
    }
}, {Collection:'accountil'})

const ClientModel = mongoose.model('ClientModel', ClientSchema)
export default ClientModel