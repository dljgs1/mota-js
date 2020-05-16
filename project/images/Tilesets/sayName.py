import os


def foreachFile(dir,callback):
    import os
    for path, _, files in os.walk(dir):
        for f in files:
            pa = os.path.join(path,f)
            print(pa)
            callback(pa)
            
res = ''
def p(n):
    global res
    n = n.split('\\')[-1]
    res += "\""+n+"\","
foreachFile(r'F:\H5mota\materials\Tilesets', p)

print(res)