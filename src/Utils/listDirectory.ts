import * as fs from 'fs';
import * as path from 'path';
export function listDirs(): Promise<any[]> {
    return new Promise((resolve: any, reject: any) => {
        let src: string = 'lib/python3.6';
        let isFile: any = (source): Boolean => fs.lstatSync(path.resolve(__dirname, source)).isFile();
        let dirs = fs.readdir(src, (err: any, files: any[]) => {
            let finished: Boolean = false;
            let f: any[] = [];
            let d: any[] = getDirectoriesRecursively(src);
            for(let i = 0; i < d.length; i++) {
                let _f: any[] = fs.readdirSync(d[i]);
                for(let y = 0; y < _f.length; y++) {
                    let _resolvedPath: string = path.resolve(__dirname, path.join(d[i], _f[y]));
                    if(isFile(_resolvedPath)) {
                        f.push(_resolvedPath);
                    }
                }
            }
            f = f.map((x) => { return x.replace(/\\/g,"/") });
            resolve(f);
        });
        function flatten(lists: any[]): any[] {
            return lists.reduce((a, b) => a.concat(b), []);
        }
          
        function getDirectories(srcpath: string): any[] {
        return fs.readdirSync(srcpath)
            .map(file => path.join(srcpath, file))
            .filter(path => fs.statSync(path).isDirectory());
        }
        
        function getDirectoriesRecursively(srcpath: string): any[] {
        return [srcpath, ...flatten(getDirectories(srcpath).map(getDirectoriesRecursively))];
        }
        
    })
}