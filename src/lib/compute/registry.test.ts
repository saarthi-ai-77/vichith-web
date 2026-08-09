import { expect, test } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function findDeclarations(dir: string): string[] {
    let results: string[] = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(findDeclarations(fullPath));
        } else if (fullPath.endsWith('.ts') && !fullPath.endsWith('.test.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Matches exact declarations of the interface or type
            if (content.includes('interface ModelCatalogEntry') || content.includes('type ModelCatalogEntry =')) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

test('exactly ONE ModelCatalogEntry declaration exists', () => {
    // Navigate from src/lib/compute/registry.test.ts to src/
    const srcDir = path.resolve(__dirname, '../..');
    const declarations = findDeclarations(srcDir);
    
    // Log for debugging if it fails
    if (declarations.length !== 1) {
        console.error('Found ModelCatalogEntry in:', declarations);
    }
    
    expect(declarations.length).toBe(1);
    
    // Use path.sep to handle both Windows and Unix paths
    const expectedSuffix = `compute${path.sep}types.ts`;
    expect(declarations[0].endsWith(expectedSuffix)).toBe(true);
});
