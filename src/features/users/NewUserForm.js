import {useState, useEffect} from 'react'
import {useAddNewUserMutation} from './usersApiSlice'
import {useNavigate, useLocation} from 'react-router-dom'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faCircleXmark, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import {ROLES} from '../../config/roles'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {selectUserById} from './usersApiSlice'

const USER_REGEX = /^[A-z]{3,20}$/
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/

const NewUserForm = ({lightmode, fullSize}) => {
    const navigate = useNavigate()
    const {id} = useSelector(state => state.auth)
    const loggedInUser = useSelector((state) => selectUserById(state, id))
    const isAdmin = loggedInUser?.roles.includes(ROLES.ADMIN)
    const path = useLocation().pathname
    const [username, setUsername] = useState('')
    const [validUsername, setValidUsername] = useState(false)
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [roles, setRoles] = useState([ROLES.USER])
    const [active, setActive] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showForm, setShowForm] = useState(true)
    const [showMessage, setShowMessage] = useState(false)
    const [canSave, setCanSave] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const [addNewUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewUserMutation()

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username))
    }, [username])

    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password))
    }, [password])

    useEffect(() => {
        setCanSave(validUsername && validPassword)
    }, [validUsername, validPassword])

    useEffect(() => {
        if (isError) {
            console.error(error)
        }
    }, [isError])

    useEffect(() => {
        if (isSuccess && path.includes('/login/new')) {
            setUsername('')
            setPassword('')
            setRoles([ROLES.USER])
            setActive(false)
            navigate('/login')
        } else if (isSuccess) {
            setUsername('')
            setPassword('')
            setRoles([ROLES.USER])
            setActive(false)
            setShowForm(false)
            setShowMessage(true)
        }
    }, [isSuccess, navigate])

    const onUsernameChanged = e => setUsername(e.target.value)
    const onPasswordChanged = e => setPassword(e.target.value)
    const onRolesChanged = e => {
        const values = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        )
        setRoles(values)
    }
    const onActiveChange = e => {
        e.preventDefault()
        setActive(!active)
    }

    const onSaveUserClicked = async (e) => {
        e.preventDefault()
        if (canSave) {
            await addNewUser({username, password, roles, active})
        }
    }

    const onPwdVisibilityChanged = () => setShowPassword(prev => !prev)

    const onGoHomeClicked = () => {
        navigate('/login')
    }

    const registerAnother = (e) => {
        e.preventDefault()
        setShowForm(true)
        setShowMessage(false)
    }

    const options = Object.values(ROLES).map(role => {
        return (
            <option
                key={role}
                value={role}
            > {role}</option >
        )
    })

    const errClass = isError ? "errmsg" : "offscreen"
    const validUserClass = !validUsername ? 'form__input--incomplete' : ''
    const validPwdClass = !validPassword ? 'form__input--incomplete' : ''

    let header
    if (path.includes('login/new')) {
        header = (
            <header className='dash-header' style={{paddingBottom: '1.5rem'}}>
                <div className = 'public__welcome'>
                    <h1><Link to="/" className="public__title nowrap" style={{textDecoration: 'none', fontWeight: '600'}}>AI Chatbot</Link></h1>
                </div>
            </header>
        )
    }

    let footer
    if (path.includes('login/new')) {
        footer = (
            <footer className="dash-footer" style={{position: 'fixed', bottom: 0, width: '100%'}}>
                <button
                    className="dash-footer__button icon-button"
                    title="Back to Login"
                    onClick={onGoHomeClicked}
                >
                    <FontAwesomeIcon icon={faCircleXmark} />
                </button>
            </footer>
        )
    }

    let chooseRoles
    if (isAdmin) {
        if (windowWidth <= 1000) {
            chooseRoles = (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'space-between'}}>
                    <label className={fullSize ? "" : "form__label"}
                        htmlFor="roles"
                        style={{
                            marginRight: '1rem',
                            verticalAlign: 'top',
                            fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                        }}>
                        Roles:
                    </label>
                    <select
                        id="roles"
                        name="roles"
                        className={`form__select`}
                        multiple={true}
                        size="3"
                        value={roles}
                        onChange={onRolesChanged}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            maxWidth: '18rem',
                            justifyContent: 'space-between',
                            fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                            padding: '0.2rem',
                        }}>
                        {options}
                    </select>
                </div>
            )
        } else {
            chooseRoles = (
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                    <label className={fullSize ? "" : "form__label"}
                        htmlFor="roles"
                        style={{
                            marginRight: '1rem',
                            verticalAlign: 'top',
                        }}>
                        Roles:
                    </label>
                    <select
                        id="roles"
                        name="roles"
                        className={`form__select`}
                        multiple={true}
                        size="3"
                        value={roles}
                        onChange={onRolesChanged}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            maxWidth: '18rem',
                            justifyContent: 'space-between'
                        }}>
                        {options}
                    </select>
                </div>
            )
        }
    } else {
        chooseRoles = null
    }

    let chooseActive
    if (isAdmin) {
        if (windowWidth <= 1000) {
            chooseActive = (
                <button
                    className='home_button'
                    type='button'
                    onClick={onActiveChange}
                    style={{fontSize: '1.5rem',
                        flexGrow: '1',
                        border: 'none',
                        borderRadius: '15px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                        fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                    }}>
                    {active ? 'Active' : 'Inactive'}
                </button>
            )
        } else {
            chooseActive = (
                <button
                    className='home_button'
                    type='button'
                    onClick={onActiveChange}
                    style={{fontSize: '1.5rem',
                        flexGrow: '1',
                        border: 'none',
                        borderRadius: '15px',
                        padding: '0.3em 0.3em',
                        textDecoration: 'none',
                    }}>
                    {active ? 'Active' : 'Inactive'}
                </button>
            )
        }
    } else {
        chooseActive = null
    }

    let message
    if (isError) {
        message = (
            <div className={errClass}
                style={{
                    width: '100%',
                }}>
                <p style={{ textAlign: 'center' }}>{error?.data?.message}</p>
            </div>
        )
    } else if (isSuccess && showMessage) {
        message = (
            <div className='successmsg'
                style={{
                    width: '100%',
                }}>
                <p style={{ textAlign: 'center' }}>User Created!</p>
            </div>
        )
    }

    let form
    if (showForm) {
        if (lightmode) {
            if (windowWidth <= 1000) {
                form = (
                    <form className="form" onSubmit={e => e.preventDefault()}>
                        {message}
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'space-between'}}>
                            <label className={fullSize ? "" : "form__label"} htmlFor="username" style={{marginRight: '1rem', fontSize: `${fullSize ? 'none' : '1.1rem'}`}}>
                                Username:
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
                                style={{
                                    textAlign: 'center',
                                    flexGrow: '1',
                                    right: '0',
                                    maxWidth: '18rem',
                                    fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'space-between' }}>
                            <label className={fullSize ? "" : "form__label"} htmlFor="password" style={{marginRight: '1rem', fontSize: `${fullSize ? 'none' : '1.1rem'}`}}>
                                Password:
                            </label>
                            <div style={{maxWidth: '18rem', display: 'flex', flexDirection: 'row', width: '100%'}}>
                                <input
                                    className={`form__input ${validPwdClass}`}
                                    id="password"
                                    name="password"
                                    type={showPassword? 'text' : 'password'}
                                    value={password}
                                    onChange={onPasswordChanged}
                                    style={{
                                        textAlign: 'center',
                                        flexGrow: '1',
                                        maxWidth: '12.5rem',
                                        width: '100%',
                                        fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                    }}
                                />
                                <button
                                    className='home_button'
                                    type='button'
                                    title={showPassword? 'Hide Password' : 'Show Password'}
                                    onClick={onPwdVisibilityChanged}
                                    style={{
                                        marginLeft: '1rem',
                                        border: 'none',
                                        borderRadius: '15px',
                                        padding: '0.3em 0.3em',
                                        textDecoration: 'none',
                                        flexGrow: '1',
                                        maxWidth: '4rem',
                                        fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                    }}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>
                        {chooseRoles}
                        {chooseActive}
                        <div style={{ display: 'flex', flexDirection: 'row'}}>
                            <button
                                className="form__submit-button"
                                type='submit'
                                disabled={!canSave}
                                onClick={onSaveUserClicked}
                                style={{
                                    fontSize: '1.5rem',
                                    padding: '0.2em 0.5em',
                                    flexGrow: '1',
                                    boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                                    fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                }}>
                                Register
                            </button>
                        </div>
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
                )
            } else {
                form = (
                    <form className="form" onSubmit={e => e.preventDefault()}>
                        {message}
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                            <label className={fullSize ? "" : "form__label"} htmlFor="username" style={{marginRight: '1rem'}}>
                                Username:
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
                                style={{
                                    textAlign: 'center',
                                    flexGrow: '1',
                                    right: '0',
                                    maxWidth: '18rem',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                            <label className={fullSize ? "" : "form__label"} htmlFor="password" style={{marginRight: '1rem'}}>
                                Password:
                            </label>
                            <div style={{maxWidth: '18rem', display: 'flex', flexDirection: 'row', width: '100%'}}>
                                <input
                                    className={`form__input ${validPwdClass}`}
                                    id="password"
                                    name="password"
                                    type={showPassword? 'text' : 'password'}
                                    value={password}
                                    onChange={onPasswordChanged}
                                    style={{
                                        textAlign: 'center',
                                        flexGrow: '1',
                                        maxWidth: '12.5rem',
                                        width: '100%',
                                    }}
                                />
                                <button
                                    className='home_button'
                                    type='button'
                                    title={showPassword? 'Hide Password' : 'Show Password'}
                                    onClick={onPwdVisibilityChanged}
                                    style={{
                                        marginLeft: '1rem',
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
                            </div>
                        </div>
                        {chooseRoles}
                        {chooseActive}
                        <div style={{ display: 'flex', flexDirection: 'row'}}>
                            <button
                                className="form__submit-button"
                                type='submit'
                                disabled={!canSave}
                                onClick={onSaveUserClicked}
                                style={{
                                    padding: '0.2em 0.5em',
                                    flexGrow: '1',
                                    boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                                }}>
                                Register
                            </button>
                        </div>
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
                )
            }
        } else {
            if (windowWidth <= 1000) {
                form = (
                    <div style={{
                        border: '6px solid rgba(103, 91, 209, 1)',
                        backgroundColor: 'rgba(157, 126, 224, 1)',
                        borderRadius: '20px',
                        padding: '1rem',
                    }}>
                        <form className="form"
                            style={{gap: '0.5rem'}}
                            onSubmit={e => e.preventDefault()}>
                            {message}
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'space-between'}}>
                                <label className={fullSize ? "" : "form__label"} htmlFor="username" style={{marginRight: '1rem', fontSize: `${fullSize ? 'none' : '1.1rem'}`}}>
                                    Username:
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
                                    style={{
                                        textAlign: 'center',
                                        flexGrow: '1',
                                        right: '0',
                                        maxWidth: '18rem',
                                        fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                        padding: '0.2rem',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'space-between' }}>
                                <label className={fullSize ? "" : "form__label"} htmlFor="password" style={{marginRight: '1rem', fontSize: `${fullSize ? 'none' : '1.1rem'}`}}>
                                    Password:
                                </label>
                                <div style={{maxWidth: '18rem', display: 'flex', flexDirection: 'row', width: '100%'}}>
                                    <input
                                        className={`form__input ${validPwdClass}`}
                                        id="password"
                                        name="password"
                                        type={showPassword? 'text' : 'password'}
                                        value={password}
                                        onChange={onPasswordChanged}
                                        style={{
                                            textAlign: 'center',
                                            flexGrow: '1',
                                            maxWidth: '12.5rem',
                                            width: '100%',
                                            fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                            padding: '0.2rem',
                                        }}
                                    />
                                    <button
                                        className='home_button'
                                        type='button'
                                        title={showPassword? 'Hide Password' : 'Show Password'}
                                        onClick={onPwdVisibilityChanged}
                                        style={{
                                            marginLeft: '1rem',
                                            border: 'none',
                                            borderRadius: '15px',
                                            padding: '0.3em 0.3em',
                                            textDecoration: 'none',
                                            flexGrow: '1',
                                            minWidth: '2.5rem',
                                            maxWidth: '4rem',
                                            fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                        }}
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </div>
                            {chooseRoles}
                            {chooseActive}
                            <div style={{ display: 'flex', flexDirection: 'row'}}>
                                <button
                                    className="form__submit-button"
                                    type='submit'
                                    disabled={!canSave}
                                    onClick={onSaveUserClicked}
                                    style={{
                                        fontSize: '1.5rem',
                                        padding: '0.2em 0.5em',
                                        flexGrow: '1',
                                        boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                                        fontSize: `${fullSize ? 'none' : '1.1rem'}`,
                                    }}>
                                    Register
                                </button>
                            </div>
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
                    </div>
                )
            } else {
                form = (
                    <div style={{
                        border: '6px solid rgba(103, 91, 209, 1)',
                        backgroundColor: 'rgba(157, 126, 224, 1)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                    }}>
                        <form className="form" onSubmit={e => e.preventDefault()}>
                            {message}
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                                <label className={fullSize ? "" : "form__label"} htmlFor="username" style={{marginRight: '1rem'}}>
                                    Username:
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
                                    style={{
                                        textAlign: 'center',
                                        flexGrow: '1',
                                        right: '0',
                                        maxWidth: '18rem',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                                <label className={fullSize ? "" : "form__label"} htmlFor="password" style={{marginRight: '1rem'}}>
                                    Password:
                                </label>
                                <div style={{maxWidth: '18rem', display: 'flex', flexDirection: 'row', width: '100%'}}>
                                    <input
                                        className={`form__input ${validPwdClass}`}
                                        id="password"
                                        name="password"
                                        type={showPassword? 'text' : 'password'}
                                        value={password}
                                        onChange={onPasswordChanged}
                                        style={{
                                            textAlign: 'center',
                                            flexGrow: '1',
                                            maxWidth: '12.5rem',
                                            width: '100%',
                                        }}
                                    />
                                    <button
                                        className='home_button'
                                        type='button'
                                        title={showPassword? 'Hide Password' : 'Show Password'}
                                        onClick={onPwdVisibilityChanged}
                                        style={{
                                            marginLeft: '1rem',
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
                                </div>
                            </div>
                            {chooseRoles}
                            {chooseActive}
                            <div style={{ display: 'flex', flexDirection: 'row'}}>
                                <button
                                    className="form__submit-button"
                                    type='submit'
                                    disabled={!canSave}
                                    onClick={onSaveUserClicked}
                                    style={{
                                        fontSize: '1.5rem',
                                        padding: '0.2em 0.5em',
                                        flexGrow: '1',
                                        boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)',
                                    }}>
                                    Register
                                </button>
                            </div>
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
                    </div>
                )
            }
        }
    } else {
        if (lightmode) {
            form = (
                <form  className="form" onSubmit={registerAnother}>
                    {message}
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                        <button
                            className="form__submit-button"
                            autoFocus
                            type='submit'
                            style={{fontSize: '1.5rem',
                                padding: '0.2em 0.5em',
                                flexGrow: '1',
                                outline: 'none',
                            }}>
                            Register Another User?
                        </button>
                    </div>
                </form>
            )
        } else {
            form = (
                <div style={{
                    border: '6px solid rgba(103, 91, 209, 1)',
                    backgroundColor: 'rgba(157, 126, 224, 1)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                }}>
                    <form  className="form" onSubmit={registerAnother}>
                        {message}
                            <button
                                className="form__submit-button"
                                autoFocus
                                type='submit'
                                style={{fontSize: '1.5rem',
                                    padding: '0.2em 0.5em',
                                    flexGrow: '1',
                                    outline: 'none',
                                }}>
                                Register Another User?
                            </button>
                    </form>
                </div>
            )
        }
    }

    const content = (
        <section>
            {header}
            <div className='public__main'
                style={{display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                    }}>
                {form}
            </div>
            {footer}
        </section>
    )

    return content
}
export default NewUserForm