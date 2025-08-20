import { readFileSync, writeFileSync } from 'fs';
import { IfpParser } from '../../src';

describe('IFP Parser tests', () => {
    it('should parse ped.ifp', () => {
        const buffer = readFileSync('./tests/assets/ped.ifp');
        const ifp = new IfpParser(buffer);
        const result = ifp.parse();
        writeFileSync('./tests/ifp/ped.ifp.test.json', JSON.stringify(result, null, 2));
    });
});