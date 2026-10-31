import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client;
let collection;
let enabled = false;

export function isDbEnabled() {
  return enabled;
}

export async function connectDb() {
  if (!config.mongoUri) {
    enabled = false;
    return false;
  }

  try {
    client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 4000 });
    await client.connect();
    collection = client.db(config.mongoDb).collection('match_results');
    await collection.createIndex({ finishedAt: -1 });
    enabled = true;
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    enabled = false;
    collection = null;
    console.warn('MongoDB unavailable, continuing without persistence:', error.message);
    return false;
  }
}

export async function saveMatchResult(result) {
  if (!enabled || !collection) return false;
  try {
    await collection.insertOne({ ...result, savedAt: new Date() });
    return true;
  } catch (error) {
    console.warn('Failed to save match result:', error.message);
    return false;
  }
}

export async function getRecentMatches(limit = 20) {
  if (!enabled || !collection) return [];
  return collection
    .find({}, { projection: { _id: 0 } })
    .sort({ finishedAt: -1 })
    .limit(Math.min(50, Math.max(1, limit)))
    .toArray();
}
