async function getServerSession() {
  return { user: { email: 'demo@example.com' } }
}

module.exports = { getServerSession }
