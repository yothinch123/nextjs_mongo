// pages/api/data.js
import { MongoClient, ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import verifyToken from '../../middleware/verifyToken';

export default async function handler(req, res) {
  const { method, body, query } = req;
  await verifyToken(req, res);

  const client = await clientPromise;
  const db = client.db('myDatabase');
  const collection = db.collection('products');

  switch (method) {
    case 'GET': try {
      let filter = {};
      if (query.name) {
        filter.name = query.name;
      }
      if (query.category) {
        filter.category = query.category;
      }
      const data = await collection.find(filter).toArray();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Unable to fetch documents' });
    }
    break;

    case 'POST':
      try {
        const result = await collection.insertOne(body);
        res.status(201).json(result.ops[0]);
      } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ error: 'Unable to create document' });
      }
      break;

    case 'PUT':
      try {
        const filter = { _id: ObjectId(query.id) };
        const result = await collection.updateOne(filter, { $set: body });
        res.status(200).json({ message: 'Document updated successfully' });
      } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Unable to update document' });
      }
      break;

    case 'DELETE':
      try {
        const filter = { _id: ObjectId(query.id) };
        const result = await collection.deleteOne(filter);
        res.status(200).json({ message: 'Document deleted successfully' });
      } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Unable to delete document' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
