export function extendDefaultFields(defaults, session) {
    return {
      data: defaults.data,
      lastActivity: defaults.lastActivity,
      userId: session.userId,
    };
  }