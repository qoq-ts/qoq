import { validator, WebRouterDocument } from '../../../src';

export const getProjectsResponse: WebRouterDocument = {
  title: 'Get Projects',
  description: 'It is a desc test',
  response: {
    page: validator.integer.document({
      description: 'Current Page',
    }),
    result: validator.array.each({
      id: validator.integer,
      name: validator.string,
    }),
    total: validator.integer.document({
      description: 'Total records amount',
    }),
  },
  headers: {
    'x-date': validator.string,
    'y-schema': validator.number.optional(),
  }
};
