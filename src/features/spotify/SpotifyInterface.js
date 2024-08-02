import {useGetStateQuery, useCreateStateMutation, useUpdateStateMutation} from './spotifyApiSlice'
import {useState, useEffect, useRef} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faPlay, faPause, faBackwardStep, faForwardStep } from "@fortawesome/free-solid-svg-icons"
import SearchResult from './SearchResult'
import { useSelector } from 'react-redux'
import VolumeSlider from './VolumeSlider'
import { IoVolumeHigh, IoVolumeLow, IoVolumeMedium, IoVolumeMute } from "react-icons/io5"

const SpotifyInterface = ({usingVolumeSlider, setUsingVolumeSlider}) => {
    const {id} = useSelector(state => state.auth)
    const [spotifyState, setSpotifyState] = useState(null)
    const [playState, setPlayState] = useState(0) // 1 for playing 0 for paused
    const [controlPlayState, setControlPlayState] = useState(0) // -1 for prev, 0 for nothing, 1 for next
    const [currentSong, setCurrentSong] = useState(['', '']) // The currently playing song
    const [songRequest, setSongRequest] = useState(['', '']) // The requested song
    const [input, setInput] = useState('') // The text in song search box
    const [searchResults, setSearchResults] = useState([]) // The search results for the song search box
    const [volume, setVolume] = useState(50) // Playback volume
    const [showSearchBar, setShowSearchBar] = useState(false) // Whether to show the search bar
    const [showSearchResults, setShowSearchResults] = useState(false) // Whether to show the search results
    const [selectedSearchResult, setSelectedSearchResult] = useState(0) // The index of the selected search result
    const searchBarRef = useRef()
    const [pressedKeys, setPressedKeys] = useState({})
    const [previousPressedKeys, setPreviousPressedKeys] = useState({})
    const [hasBeenSuccess, setHasBeenSuccess] = useState(false)
    const [mouseInSearchBar, setMouseInSearchBar] = useState(false)
    const [mouseInCurrentSong, setMouseInCurrentSong] = useState(false)

    useEffect(() => {
        if (usingVolumeSlider) {
            document.body.style.cursor = "pointer"
        } else {
            document.body.style.cursor = "default"
        }
    }, [usingVolumeSlider])
    
    const {
        data,
        isLoading,
        isSuccess,
        isError,
    } = useGetStateQuery({}, {
        pollingInterval: 1000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
    })
    
    useEffect(() => {
        if (data) {
            setHasBeenSuccess(true)
            setSpotifyState(data.entities[data.ids[0]])
        }
    }, [data])

    const [createState, {
        isLoading: createStateIsLoading,
        isSuccess: createStateIsSuccess,
        isError: createStateIsError,
        error: createStateError
    }] = useCreateStateMutation()

    const [updateState, {
        isLoading: updateStateIsLoading,
        isSuccess: updateStateIsSuccess,
        isError: updateStateIsError,
        error: updateStateError
    }] = useUpdateStateMutation()

    // useEffect(() => {
    //     if (isError) {
    //         createState({sourceId: id, songRequest, input, playState, controlPlayState, volume})
    //     }
    // }, [isError])

    useEffect(() => {
        if (spotifyState) {
            setPlayState(spotifyState.playState)
            setControlPlayState(spotifyState.controlPlayState)
            setCurrentSong(spotifyState.currentSong)
            setSearchResults(spotifyState.searchResults)
            setSongRequest(spotifyState.songRequest)
            if (!usingVolumeSlider) {
                setVolume(spotifyState.volume)
            }
        }
    }, [spotifyState])

    useEffect(() => {
        if (hasBeenSuccess && !usingVolumeSlider) {
            updateState({sourceId: id, songRequest, input, playState, controlPlayState, volume})
        }
    }, [playState, controlPlayState, songRequest, input, volume, usingVolumeSlider])

    useEffect(() => {
        if (input.length) {
            setShowSearchResults(true)
        } else {
            setShowSearchResults(false)
            setSearchResults([])
        }
    }, [input])

    const handleInputChange = (e) => {
        setInput(e.target.value)
    }

    const handlePlayPause = () => {
        setPlayState(playState === 1 ? 0 : 1)
    }

    const handlePrev = () => {
        setControlPlayState(-1)
    }

    const handleNext = () => {
        setControlPlayState(1)
    }

    const handleSubmit = () => {
        if (input.length && searchResults.length) {
            setSongRequest(searchResults[selectedSearchResult])
            setInput('')
            setShowSearchBar(false)
            setShowSearchResults(false)
            setSelectedSearchResult(0)
        }
    }

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
        }
    }

    useEffect(() => {
        const handleClickAwayFromSearchBar = (e) => {
            const spotifyBlock = document.querySelector('.spotifyBlock')
            if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
                if (!spotifyBlock || !spotifyBlock.contains(e.target)) {
                    setShowSearchBar(false)
                    setInput('')
                    setShowSearchResults(false)
                    setSelectedSearchResult(0)
                }
            }
        }

        const handleKeyDown = (e) => {
            if (searchBarRef.current === document.activeElement) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    setPressedKeys(prevState => {
                        setPreviousPressedKeys(prevState)
                        return {
                            ...prevState,
                            [e.key]: true
                        }
                    })
                }
            }
        }

        const handleKeyUp = (e) => {
            if (searchBarRef.current === document.activeElement) {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    setPressedKeys(prevState => {
                            setPreviousPressedKeys(prevState)
                            return {
                                ...prevState,
                                [e.key]: false
                            }
                    })
                }
            }
        }

        window.addEventListener('click', handleClickAwayFromSearchBar)
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('click', handleClickAwayFromSearchBar)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useEffect(() => {
        if (showSearchResults) {
            if (!previousPressedKeys['ArrowDown'] && pressedKeys['ArrowDown']) {
                setSelectedSearchResult(selectedSearchResult < searchResults.length - 1 ? selectedSearchResult + 1 : 0)
            } else if (!previousPressedKeys['ArrowUp'] && pressedKeys['ArrowUp']) {
                setSelectedSearchResult(selectedSearchResult > 0 ? selectedSearchResult - 1 : searchResults.length - 1)
            } else if (pressedKeys['Enter']) {
                handleSubmit()
            }
        }
    }, [pressedKeys])

    let musicBars
    if (playState === 1) {
        musicBars = (
            <div className="music-bars">
                <div className="music-bar"></div>
                <div className="music-bar"></div>
                <div className="music-bar"></div>
                <div className="music-bar"></div>
                <div className="music-bar"></div>
            </div>
        )
    } else {
        musicBars = (
            <div className="music-bars">
                <div className="still-music-bar"></div>
                <div className="still-music-bar"></div>
                <div className="still-music-bar"></div>
                <div className="still-music-bar"></div>
                <div className="still-music-bar"></div>
            </div>
        )
    }

    let searchBar
    if (showSearchBar) {
        searchBar = (
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: '-5px' }}>
                <div
                    className={`conversationButton`}
                    autoComplete="off"
                    style={{width: '45rem',
                            marginBottom: '10px',
                            height: '2rem',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            padding: '0.3em 0.3em'
                        }}
                    onMouseEnter={() => setMouseInSearchBar(true)}
                    onMouseLeave={() => setMouseInSearchBar(false)}
                    >
                    <input
                        className={mouseInSearchBar ? 'conversationInputHover' : 'conversationInput'}
                        ref={searchBarRef}
                        type="text"
                        value={input}
                        autoFocus
                        onChange={handleInputChange}
                        onKeyDown={handleEnter}
                        style={{
                            width: '100%',
                            height: '100%',
                            fontSize: '15px',
                            backgroundColor: 'transparent',
                        }}/>
                </div>
                <button
                    className='home_button'
                    onClick={handleSubmit}
                    style={{ width: '12rem',
                            height: '2rem',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.3em 0.3em',
                            textDecoration: 'none',
                            fontSize: '15px',
                            boxShadow: 'none',
                        }}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
            </div>
        )
    }

    let searchResultsContent
    if (showSearchResults && searchResults.length) {
        searchResultsContent = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '5px', marginBottom: '10px' }}>
                {searchResults.map((result, index) => 
                    <SearchResult
                        key={index}
                        result={result}
                        setSongRequest={setSongRequest}
                        setInput={setInput}
                        setShowSearchBar={setShowSearchBar}
                        searchResults={searchResults}
                        setShowSearchResults={setShowSearchResults}
                        selectedSearchResult={selectedSearchResult}
                        setSelectedSearchResult={setSelectedSearchResult}
                        />)}
            </div>
        )
    } else if (showSearchResults) {
        searchResultsContent = (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '5px', marginBottom: '10px' }}>
                <button
                    className="songButton">
                    <div className='songTitle'
                        style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: '1',
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginTop: '3px',
                            paddingBottom: '3px',
                            marginBottom: '-10px',
                        }}>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                    </div>
                </button>
            </div>
        )
    }

    const content = (
        <div className='spotifyBlock'>
            <div className='songTitleButton'
                title={`${currentSong[0]}`}
                onClick={() => {
                    setShowSearchBar(!showSearchBar)
                    setInput('')
                    setShowSearchResults(false)
                }}
                onMouseEnter={() => setMouseInCurrentSong(true)}
                onMouseLeave={() => setMouseInCurrentSong(false)}
                style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        marginBottom: '5px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '15px',
                        fontWeight: 'bolder',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                    }}>
                {musicBars}
                <div className={currentSong[0]?.length > 15 && (playState === 1 || mouseInCurrentSong) ? 'scrollingSongTitle' : 'songTitle'}
                    style={{cursor: 'pointer'}}>
                    {currentSong[0]}
                </div>
            </div>
            {searchBar}
            {searchResultsContent}
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: '5px' }}>
                <button
                    className='home_button'
                    onClick={handlePrev}
                    style={{ width: '12rem',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.3em 0.3em',
                            textDecoration: 'none',
                            fontSize: '15px',
                            boxShadow: 'none',
                        }}>
                    <FontAwesomeIcon icon={faBackwardStep} />
                </button>
                <button
                    className='home_button'
                    onClick={handlePlayPause}
                    style={{ width: '12rem',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.3em 0.3em',
                            textDecoration: 'none',
                            fontSize: '15px',
                            boxShadow: 'none',
                        }}>
                    <FontAwesomeIcon icon={playState === 1 ? faPause : faPlay} />
                </button>
                <button
                    className='home_button'
                    onClick={handleNext}
                    style={{ width: '12rem',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.3em 0.3em',
                            textDecoration: 'none',
                            fontSize: '15px',
                            boxShadow: 'none',
                        }}>
                    <FontAwesomeIcon icon={faForwardStep} />
                </button>
            </div>
            <div className='volumeSlider'>
                {volume === 0 && <IoVolumeMute />}
                {volume > 0 && volume < 33 && <IoVolumeLow />}
                {volume >= 33 && volume < 66 && <IoVolumeMedium />}
                {volume >= 66 && volume <= 100 && <IoVolumeHigh />}
                <VolumeSlider
                    volume={volume}
                    setVolume={setVolume}
                    setUsingVolumeSlider={setUsingVolumeSlider} />
            </div>
        </div>
    )
    
    return content
}

export default SpotifyInterface