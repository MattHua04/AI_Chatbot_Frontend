import { Link } from 'react-router-dom'

const Public = () => {
    const content = (
        <section className="public">
            <header className='public__header'>
                <div className = 'public__welcome'>
                    <h1><span className="nowrap">AI Chatbot</span></h1>
                </div>
            </header>
            <main className="public__main">
                <Link className = "login__button" to="/login">Login</Link>
                <svg width="500" height="300" className='public__decription-path'>
                    <path id="curve" d="M 0 90 Q 225 450 450 50" fill="none"/>
                    <text fontSize="35" fill="#ddefff">
                        <textPath href="#curve">A virtual assistant for all your needs</textPath>
                    </text>
                </svg>
            </main>
            <footer>

            </footer>
        </section>

    )
    return content
}
export default Public