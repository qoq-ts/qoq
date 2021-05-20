import { validator, WebRouter } from '../../../src';

export const router = new WebRouter({
  slots: null,
});

router
  .get('/projects')
  .query({
    page: validator.integer.min(1),
    pageSize: validator.integer.default(10),
    projectId: validator.integer,
    name: validator.string.toLowerCase().optional().document({
      label: 'Project Name',
      description: 'You can filter the project name',
    }),
  })
  .document(() => import('./router1.doc').then((item) => item.getProjectsResponse))
  .action((ctx) => {
    ctx.body = 'Hello router1';
  });

router
  .post('/projects')
  .query({
    projectId: validator.integer,
    name: validator.string.toLowerCase().document({
      label: 'Project search name',
    }),
    description: validator.string.optional().maxLength(255),
  })
  .document({
    title: 'Create a project',
    description: 'Create a project description',
    response: [
      {
        statusCode: 201,
        contentType: 'application/json',
        content: {
          id: validator.integer,
        },
      },
    ],
  })
  .action((ctx) => {
    ctx.body = {
      id: 1,
    };
    ctx.status = 201;
  });
