import { validator, WebRouterDocument } from '../../../src';

export const getUsersResponse: WebRouterDocument = {
  title: 'Get Users',
  description: 'Get all users from db',
  response: validator.url,
};
