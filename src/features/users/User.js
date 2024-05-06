import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faSun, faMoon } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUserById } from './usersApiSlice'
import { useUpdateUserMutation } from './usersApiSlice'
import { selectCurrentId } from '../auth/authSlice'

const User = ({ userId }) => {
    const user = useSelector(state => selectUserById(state, userId))
    const sourceId = useSelector(selectCurrentId)

    const navigate = useNavigate()

    const [updateUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateUserMutation()

    const changeActive = (e) => {
        e.preventDefault()
        updateUser({sourceId: sourceId, id: userId, username: user.username, roles: user.roles, active: !user.active})
    }

    if (user) {
        const handleEdit = () => navigate(`/dash/users/${userId}`)

        const userRolesString = user.roles.toString().replaceAll(',', ', ')

        return (
            <tr className="table__row user">
                <td className={`table__cell`}>{user.username}</td>
                <td className={`table__cell`}>{userRolesString}</td>
                <td className={`table__cell`}>
                    <button
                        className="icon-button table__button"
                        onClick={changeActive}>
                        <FontAwesomeIcon icon={user.active ? faSun : faMoon}
                            style={{
                                padding: '10px',
                                color: user.active ? '#ffe730' : '#606060',
                                background: user.active
                                    ? 'radial-gradient(rgba(84, 71, 209, 0.7), rgba(84, 71, 209, 0.5), transparent, transparent)'
                                    : 'radial-gradient(rgba(84, 71, 209, 0.7), rgba(84, 71, 209, 0.5), rgba(84, 71, 209, 0.2), transparent, transparent, transparent)',
                            }}/>
                    </button>
                </td>
                <td className={`table__cell`}>
                    <button
                        className="icon-button table__button"
                        onClick={handleEdit}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                </td>
            </tr>
        )

    } else return null
}
export default User