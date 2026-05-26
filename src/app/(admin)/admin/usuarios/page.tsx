import { getAdminUsers } from './actions'
import UsuariosAdminClient from './usuarios-admin-client'

export default async function UsuariosPage() {
  const users = await getAdminUsers()
  return <UsuariosAdminClient initialUsers={users} />
}
