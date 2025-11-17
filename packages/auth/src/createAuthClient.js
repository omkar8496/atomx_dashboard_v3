const memoryStore = new Map();

function setSession(key, value) {
  memoryStore.set(key, {
    value,
    updatedAt: Date.now()
  });
}

function getSession(key) {
  return memoryStore.get(key);
}

export function createAuthClient({ audience, project }) {
  const namespace = `${project}:${audience}`;

  return {
    async login({ email }) {
      const token = `${namespace}:${email}:${Date.now()}`;
      setSession(namespace, { email, token });
      return { token, email };
    },
    async logout() {
      memoryStore.delete(namespace);
    },
    getSession() {
      return getSession(namespace);
    }
  };
}
