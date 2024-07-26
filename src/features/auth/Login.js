import {useRef, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from './authSlice'
import { useLoginMutation } from './authApiSlice'
import usePersist from '../../hooks/usePersist'

const USER_REGEX = /^[A-z]{3,20}$/
const PWD_REGEX = /^[A-z0-9!@#$%]{4,12}$/

const Login = ({setView, setCurrentConversationId}) => {
    localStorage.setItem('view', '')
    const userRef = useRef()
    const errRef = useRef()
    const [username, setUsername] = useState('')
    const [validUsername, setValidUsername] = useState(false)
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [errMsg, setErrMsg] = useState('')
    const [persist, setPersist] = usePersist()
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        setValidUsername(USER_REGEX.test(username))
    }, [username])

    useEffect(() => {
        setValidPassword(PWD_REGEX.test(password))
    }, [password])
    
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, {isLoading}] = useLoginMutation()

    const canSave = [validUsername, validPassword].every(Boolean) && !isLoading

    const validUserClass = !validUsername ? 'form__input--incomplete' : ''
    const validPwdClass = !validPassword ? 'form__input--incomplete' : ''

    useEffect(() => {
        userRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [username, password])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!canSave) {
            setErrMsg('Invalid Username or Password')
        } else {
            try {
                const { accessToken, id, active } = await login({ username, password }).unwrap()
                dispatch(setCredentials({ accessToken, username, id, active }))
                setUsername('')
                setPassword('')
                setView('')
                setCurrentConversationId('')
                navigate('/dash')
            } catch (err) {
                if (!err.status) {
                    setErrMsg('No Server Response')
                } else if (err.status === 400) {
                    setErrMsg('Missing Username or Password')
                } else if (err.status === 401) {
                    setErrMsg('Wrong username or password')
                } else if (err.status === 402) {
                    setErrMsg('Account Inactive')
                } else {
                    setErrMsg(err.data?.message)
                }
                errRef.current.focus()
            }
        }
    }

    const handleRegister = (e) => {
        e.preventDefault()
        navigate('/login/new')
    }

    const handleUserInput = (e) => setUsername(e.target.value)
    const handlePwdInput = (e) => setPassword(e.target.value)
    const handleToggle = (e) => {
        e.preventDefault()
        setPersist(prev => !prev)
    }

    const handlePwdVisibility = (e) => {
        e.preventDefault()
        setShowPassword(prev => !prev)
    }

    const errClass = errMsg ? "errmsg" : "offscreen"

    if (isLoading) return <p>Loading...</p>

    const onGoHomeClicked = () => navigate(`/`)

    const content = (
        <section>
            <header className='dash-header'>
                <div className = 'public__welcome' style={{ display: 'flex', flexShrink: '0'}}>
                    <h1><Link to="/" className="public__title nowrap">AI Chatbot</Link></h1>
                </div>
            </header>
            <main className='public__main'>
                <form className="form" onSubmit={handleSubmit} style={{ width: '30vw'}}>
                    <div className={errClass}>
                        <p ref={errRef} aria-live="assertive" style={{ textAlign: 'center', margin: '0 auto' }}>{errMsg}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                        <label htmlFor="username" style={{marginRight: '1rem'}}>Username:</label>
                        <input
                            className={`form__input ${validUserClass}`}
                            style={{fontSize: '0.75em',
                                textAlign: 'center',
                                flexGrow: '1',
                                maxWidth: '18rem',
                                minWidth: '0px'
                            }}
                            type="text"
                            id="username"
                            ref={userRef}
                            value={username}
                            onChange={handleUserInput}
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                        <label htmlFor="password" style={{marginRight: '1rem'}}>Password:</label>
                        <div style={{maxWidth: '18rem', display: 'flex', flexDirection: 'row', width: '100%'}}>
                            <input
                                className={`form__input ${validPwdClass}`}
                                style={{
                                    fontSize: '0.75em',
                                    width: '100%',
                                    textAlign: 'center',
                                    flexGrow: '1',
                                    minWidth: '0px'
                                }}
                                type={showPassword? 'text' : 'password'}
                                id="password"
                                onChange={handlePwdInput}
                                value={password}
                                required
                            />
                            <button
                                className='home_button'
                                type='button'
                                title={showPassword? 'Hide Password' : 'Show Password'}
                                onClick={handlePwdVisibility}
                                style={{marginLeft: '1rem',
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
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                        <label htmlFor="persist" style={{marginRight: '1rem', whiteSpace: 'nowrap'}}>Trust Device?</label>
                        <button
                            className='home_button'
                            type='button'
                            onClick={handleToggle}
                            aria-pressed={persist}
                            style={{
                                width: '50%',
                                maxWidth: '18rem',
                                border: 'none',
                                borderRadius: '15px',
                                padding: '0.3em 0.3em',
                                textDecoration: 'none',
                                flexGrow: '1'
                            }}
                        >
                            {persist ? 'Yes' : 'No'}
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <button className="form__submit-button"
                            style={{fontSize: '1em',
                                padding: '0.2em 0.5em',
                                flexGrow: '1',
                                boxShadow: '0px 5px 8px rgba(84, 71, 209, 0.718)'
                            }}>
                            Login
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <button className='home_button'
                            onClick={handleRegister}
                            style={{fontSize: '1em',
                                flexGrow: '1',
                                border: 'none',
                                borderRadius: '15px',
                                padding: '0.3em 0.3em',
                                textDecoration: 'none',
                            }}>
                            Register
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                        {/* Hidden input to prevent autofill */}
                        <input type="password"
                            autoComplete="password"
                            aria-autocomplete="none"
                            data-custom-attribute="random-string"
                            style={{ display: 'none' }}
                        />
                    </div>
                </form>
            </main>
            <footer className="dash-footer" style={{position: 'fixed', bottom: 0, width: '100%'}}>
                <button
                    className="dash-footer__button icon-button"
                    title="Home"
                    onClick={onGoHomeClicked}
                >
                    <FontAwesomeIcon icon={faHouse} />
                </button>
            </footer>
        </section>
    )

    return content
}
export default Login