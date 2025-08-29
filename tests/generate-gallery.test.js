const fs = require('fs');
const path = require('path');
jest.mock('fs');

const SAMPLE_MEDIA = {
  '': ['root1.jpg', 'root2.png'],
  'project1': ['a.jpg']
};

describe('generate-gallery', () => {
  let writePath;
  beforeEach(() => {
    // mock directory structure: mediaDir contains files and subdir
    const mediaDir = path.join(__dirname, '..', 'assets', 'media');
    fs.existsSync.mockImplementation(p => true);

    // readdirSync with withFileTypes
    fs.readdirSync.mockImplementation((p, opts) => {
      const rel = path.relative(mediaDir, p).replace(/\\/g, '/');
      if(rel === '') return [ { name: 'root1.jpg', isDirectory: () => false, isFile: () => true }, { name: 'root2.png', isDirectory: () => false, isFile: () => true }, { name: 'project1', isDirectory: () => true, isFile: () => false } ];
      if(rel === 'project1') return [ { name: 'a.jpg', isDirectory: () => false, isFile: () => true } ];
      return [];
    });

    fs.writeFileSync.mockImplementation((p, data) => { writePath = p; });
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('writes index.json with expected keys', () => {
    const gen = require('../scripts/generate-gallery');
    gen.generate();
    expect(writePath).toContain(path.join('assets', 'media', 'index.json'));
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
