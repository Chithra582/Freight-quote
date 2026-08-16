import { INITIAL_MASTER_DATA } from './masterDataMock';

const PREFIX = 'master_data_';

// Initialize localStorage with mock data if not already present
export const initializeMasterData = () => {
  Object.keys(INITIAL_MASTER_DATA).forEach((key) => {
    const storageKey = `${PREFIX}${key}`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(INITIAL_MASTER_DATA[key]));
    }
  });
};

// Fetch all items for a collection
export const getItems = (collectionName) => {
  initializeMasterData(); // Ensure database is initialized
  const storageKey = `${PREFIX}${collectionName}`;
  const data = localStorage.getItem(storageKey);
  try {
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error parsing master data for ${collectionName}:`, error);
    return [];
  }
};

// Save items back to localStorage
const saveItems = (collectionName, items) => {
  const storageKey = `${PREFIX}${collectionName}`;
  localStorage.setItem(storageKey, JSON.stringify(items));
};

// Add a new item to a collection
export const addItem = (collectionName, item) => {
  const items = getItems(collectionName);
  const updatedItems = [...items, item];
  saveItems(collectionName, updatedItems);
  return updatedItems;
};

// Update an existing item in a collection
export const updateItem = (collectionName, keyField, keyValue, updatedItem) => {
  const items = getItems(collectionName);
  const updatedItems = items.map((item) => {
    if (item[keyField] === keyValue) {
      return { ...item, ...updatedItem };
    }
    return item;
  });
  saveItems(collectionName, updatedItems);
  return updatedItems;
};

// Delete an item from a collection
export const deleteItem = (collectionName, keyField, keyValue) => {
  const items = getItems(collectionName);
  const updatedItems = items.filter((item) => item[keyField] !== keyValue);
  saveItems(collectionName, updatedItems);
  return updatedItems;
};
