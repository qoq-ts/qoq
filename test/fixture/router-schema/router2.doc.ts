import { validator, WebRouterDocument } from '../../../src';

export const getUsersResponse: WebRouterDocument = {
  title: 'Get Users',
  description: 'Get all users from db',
  response: [
    {
      statusCode: 200,
      content: validator.url,
    }
  ],
};
