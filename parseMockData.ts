import * as fs from 'fs';

const mockData = fs.readFileSync('src/lib/mockData.ts', 'utf8');

// The file contains specific sections. We can carve it up using string matching or regex.
const sections = {
    ingredients: '',
    recipes: '',
    orders: '',
    users: '',
    system: '',
};

// Very basic splitting by looking for export const.
const lines = mockData.split('\n');
let currentFile = '';
let currentOutput = '';

for (const line of lines) {
    if (line.includes('// ========================================')) continue;
    
    if (line.includes('export const ingredients')) currentFile = 'ingredients';
    else if (line.includes('export const recipes')) currentFile = 'recipes';
    else if (line.includes('export const mockOrders')) currentFile = 'orders';
    else if (line.includes('export const mockUser') || line.includes('export const bioAgeHistory')) currentFile = 'users';
    else if (line.includes('export const quizQuestions') || line.includes('export const rewards') || line.includes('export const elementDescriptions')) currentFile = 'system';

    if (currentFile && currentFile in sections) {
        sections[currentFile as keyof typeof sections] += line + '\n';
    }
}

// Write the files out
fs.writeFileSync('src/lib/data/ingredients.ts', `import { Ingredient } from '../types';\n\n` + sections.ingredients);
fs.writeFileSync('src/lib/data/recipes.ts', `import { RecipeData } from '../types';\n\n` + sections.recipes);
fs.writeFileSync('src/lib/data/orders.ts', `import { Order } from '../types';\nimport { ingredients } from './ingredients';\n\n` + sections.orders);
fs.writeFileSync('src/lib/data/users.ts', `import { UserProfile, BioAgeHistory } from '../types';\n\n` + sections.users);
fs.writeFileSync('src/lib/data/system.ts', `import { ElementQuestion, Reward } from '../types';\n\n` + sections.system);

