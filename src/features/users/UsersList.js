import { useGetUsersQuery } from "./usersApiSlice"
import User from './User'
import { useSelector } from 'react-redux'
import { selectUserById } from './usersApiSlice'
import { ROLES } from '../../config/roles'

const UsersList = ({setView, setEditingUserId}) => {
    const {id} = useSelector(state => state.auth)
    const user = useSelector(state => selectUserById(state, id))
    const isAdmin = user?.roles.includes(ROLES.ADMIN)

    const {
        data: users,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetUsersQuery('usersList', {
        pollingInterval: 60000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
    })

    let content

    if (isLoading || !user) content = <p>Loading...</p>

    if (isError) {
        content = <p className="errmsg">{error?.data?.message}</p>
    }

    if (!isAdmin && user) {
        content = <p className="errmsg">Unauthorized</p>
    }

    if (isSuccess && isAdmin) {
        const { ids } = users

        const tableContent = ids?.length && ids.map(userId => <User key={userId} userId={userId} setView={setView} setEditingUserId={setEditingUserId} />)

        content = (
            <div style={{
                width: '100%',
            }}>
                <table className="table table--users"
                    style={{
                        padding: '0px 10px',
                        maxHeight: '75dvh',
                        paddingBottom: '5px',
                    }}>
                    <thead className="table__thead">
                        <tr>
                            <th scope="col" className="table__th user__username">Username</th>
                            <th scope="col" className="table__th user__roles">Roles</th>
                            <th scope="col" className="table__th user__roles">Active</th>
                            <th scope="col" className="table__th user__edit">Edit</th>
                        </tr>
                    </thead>
                </table>
                <table className="table table--users"
                    style={{
                        padding: '0px 10px',
                        maxHeight: '75dvh',
                        paddingBottom: '5em',
                    }}>
                    <tbody className="table__body">
                        {tableContent}
                    </tbody>
                </table>
            </div>
        )
    }

    return content
}
export default UsersList