module.exports = {
  async redirects() {
    return [
      { source: '/', destination: '/lawyer?dev-auth=1', permanent: false },
      { source: '/lawyer', destination: '/lawyer?dev-auth=1', permanent: false },
    ];
  },
};
