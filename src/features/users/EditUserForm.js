import { useState, useEffect, useRef } from "react"
import { useUpdateUserMutation, useDeleteUserMutation, selectUserById } from "./usersApiSlice"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faTrashCan, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { ROLES } from "../../config/roles"
import { setCredentials } from "../auth/authSlice"
import { useDispatch } from 'react-redux'
import { useSendLogoutMutation, useUpdateMutation } from "../auth/authApiSlice"
import { useSelector } from 'react-redux'
import { selectCurrentToken, selectCurrentId } from '../auth/authSlice'
import useAuth from "../../hooks/useAuth"

const USER_REGEX = /^[A-z]{3,20}$/
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/

const EditUserForm = ({user}) => {
    const [updateUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateUserMutation()
    
    const [deleteUser, {
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delError
    }] = useDeleteUserMutation()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const token = useSelector(selectCurrentToken)
    const [username, setUsername] = useState(user.username)
    const [validUsername, setValidUsername] = useState(true)
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [roles, setRoles] = useState(user.roles)
    const [active, setActive] = useState(user.active)
    const [showPassword, setShowPassword] = useState(false)
    const { roles: loggedInUserRoles } = useAuth()
    const sourceId = useSelector(selectCurrentId)
    const isAdmin = loggedInUserRoles.includes('Admin')
    const targetUserIsAdmin = user.roles.includes('Admin')

    const [sendLogout] = useSendLogoutMutation()

    const [update] = useUpdateMutation()

    useEffect(() => {
        setUsername(user.username)
        setRoles(user.roles)
    }, [user])

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username))
    }, [username])

    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password))
    }, [password])

    useEffect(() => {
        if (isSuccess) {
            setUsername('')
            setPassword('')
            setRoles([])
            navigate(-1)
        } else if (isDelSuccess) {
            setUsername('')
            setPassword('')
            setRoles([])
            if (loggedInUser.id === user.id) {
                sendLogout()
                navigate(`/`)
            } else {
                navigate(-1)
            }
        }
    }, [isSuccess, isDelSuccess, navigate])

    const onUsernameChanged = e => setUsername(e.target.value)
    const onPasswordChanged = e => setPassword(e.target.value)
    const onRolesChanged = e => {
        const values = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        )
        setRoles(values)
    }
    const onActiveChange = e => !targetUserIsAdmin ? setActive(!active) : setActive(active)

    const onSaveUserClicked = async (e) => {
        if (password) {
            await updateUser({sourceId: sourceId, id: user.id, username, password, roles, active})
            if (loggedInUser.id === user.id) {
                const { accessToken, id, active } = await update({ username }).unwrap()
                dispatch(setCredentials({ accessToken, username, id, active }))
            }
        } else {
            await updateUser({sourceId: sourceId, id: user.id, username, roles, active})
            if (loggedInUser.id === user.id) {
                const { accessToken, id, active } = await update({ username }).unwrap()
                dispatch(setCredentials({ accessToken, username, id, active }))
            }
        }
    }

    const onDeleteUserClicked = async () => {
        await deleteUser({sourceId: sourceId, id: user.id})
    }

    const handlePwdVisibility = (e) => {
        e.preventDefault()
        setShowPassword(prev => !prev)
    }

    // Admin users can change other users' roles
    const {id} = useSelector(state => state.auth)
    const loggedInUser = useSelector((state) => selectUserById(state, id))

    const visibleRoles = loggedInUser?.roles.includes(ROLES.ADMIN) ? [ROLES.ADMIN, ROLES.USER] : []

    const options = Object.values(ROLES)
        .filter(role => visibleRoles.includes(role))
        .map(role => {
        return (
            <option
                key={role}
                value={role}
            > {role}</option >
        )
    })

    let canSave
    if (password && !validPassword) {
        canSave = [roles.length, validUsername, validPassword].every(Boolean) && !isLoading
    } else {
        canSave = [roles.length, validUsername].every(Boolean) && !isLoading
    }

    const errClass = (isError || isDelError) ? "errmsg" : "offscreen"
    const validUserClass = !validUsername ? 'form__input--incomplete' : ''
    const validPwdClass = !validPassword ? 'form__input--incomplete' : ''
    const validRolesClass = !Boolean(roles.length) ? 'form__input--incomplete' : ''

    const errContent = (error?.data?.message || delError?.data?.message) ?? ''

    let err
    if (isError || isDelError) {
        err = <div className={errClass}>{errContent}</div>
    } else {
        err = null
    }

    let roleSelect
    if (visibleRoles.length) {
        roleSelect = (
            <>
                <label className="form__label" htmlFor="roles">
                    Role:
                </label>
                <select
                    id="roles"
                    name="roles"
                    className={`form__select ${validRolesClass}`}
                    multiple={true}
                    size={visibleRoles.length}
                    value={roles}
                    onChange={onRolesChanged}
                >
                    {options}
                </select>
            </>
        )
    }

    let chooseActive
    if (isAdmin) {
        chooseActive = (
            <button
                className="form__submit-button"
                onClick={onActiveChange}
                style={{fontSize: '1em',
                    padding: '0.2em 0.5em',
                    flexGrow: '1'
                }}>
                {active ? 'Active' : 'Inactive'}
            </button>
        )
    } else {
        chooseActive = null
    }

    const content = (
        <section style={{display: 'flex', flexDirection: 'column', flexGrow: '1'}}>
            <form className="form" onSubmit={e => e.preventDefault()}>
                {err}
                <div className="form__title-row">
                    <h2>Edit Profile</h2>
                    <div className="form__action-buttons">
                        <button
                            className="icon-button"
                            title="Save"
                            onClick={onSaveUserClicked}
                            disabled={!canSave}
                        >
                            <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                            className="icon-button"
                            title="Delete"
                            onClick={onDeleteUserClicked}
                        >
                            <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                    </div>
                </div>
                {chooseActive}
                <label className="form__label" htmlFor="username">
                    Username: <span className="nowrap">(3-20 letters)</span>
                </label>
                <input
                    className={`form__input ${validUserClass}`}
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="off"
                    autoFocus
                    value={username}
                    onChange={onUsernameChanged}
                />

                <label className="form__label" htmlFor="password">
                    Password: <span className="nowrap">(optional 4-12 characters)</span>
                </label>
                <div className="nowrap" style={{ display: 'flex' }}>
                    <button
                        className='home_button'
                        type='button'
                        title={showPassword? 'Hide Password' : 'Show Password'}
                        onClick={handlePwdVisibility}
                        style={{marginRight: '1rem',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '0.3em 0.3em',
                            textDecoration: 'none',
                            flexGrow: '1',
                            maxWidth: '4rem',
                        }}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                    <input
                        className={`form__input`}
                        id="password"
                        name="password"
                        type={showPassword? 'text' : 'password'}
                        value={password}
                        onChange={onPasswordChanged}
                        style={{
                            flex: '1',
                            minWidth: '0px',
                        }}
                    />
                </div>
                {roleSelect}
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                    {/* Hidden input to prevent autofill */}
                    <input type="password"
                        autoComplete="new-password"
                        aria-autocomplete="none"
                        data-custom-attribute="random-string"
                        style={{ display: 'none' }}
                    />
                </div>
            </form>
        </section>
    )

    return content
}

export default EditUserForm