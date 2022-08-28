import 'reflect-metadata';

export function get(path: string) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    Reflect.defineMetadata('path', path, desc.value, key);
  };
}