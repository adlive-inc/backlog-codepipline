export default {
  type: 'object',
  properties: {
    id: {
      type: 'number',
    },
    project: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
        },
        projectKey: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        chartEnabled: {
          type: 'boolean',
        },
        subtaskingEnabled: {
          type: 'boolean',
        },
        projectLeaderCanEditProjectLeader: {
          type: 'boolean',
        },
        useWikiTreeView: {
          type: 'boolean',
        },
        textFormattingRule: {
          type: 'string',
        },
        archived: {
          type: 'boolean',
        },
      },
    },
    content: {
      type: 'object',
      properties: {
        change_type: {
          type: 'string',
        },
        ref: {
          type: 'string',
        },
        repository: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
            },
            name: {
              type: 'string',
            },
          },
        },
        revision_count: {
          type: 'number',
        },
        revision_type: {
          type: 'string',
        },
        revisions: {
          type: 'array',
        },
      },
    },
  },
} as const;
