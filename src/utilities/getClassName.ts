import { doesContainClassDeclaration } from './doesContainClassDeclaration';

export function getClassName(loc: string): string {
  if (doesContainClassDeclaration(loc)) {
    return loc.split('class ')[1].trim().split(' ')[0].replace('{', '');
  } else {
    return '';
  }
}
