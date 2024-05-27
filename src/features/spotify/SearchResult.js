const SearchResult = ({ result, setSongRequest, setInput, setShowSearchBar, searchResults, setShowSearchResults, selectedSearchResult, setSelectedSearchResult }) => {
    const handleClick = () => {
        setSongRequest(result)
        setInput('')
        setShowSearchBar(false)
        setShowSearchResults(false)
        setSelectedSearchResult(0)
    }

    let searchResult
    if (selectedSearchResult === searchResults.indexOf(result)) {
        if (result[1].includes("playlist")) {
            searchResult = (
                <button
                    className="selectedPlaylistButton"
                    onClick={handleClick}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '15px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                        }}>
                        <img src={result[2]} alt="" style={{
                            height: '2.5em',
                            borderRadius: '10px',
                            marginRight: '5px',
                            width: '2.5em',
                            zIndex: '999',
                        }}/>
                        <div className={result[0].length > 15 ? 'scrollingSongTitle' : 'songTitle'}>{result[0]}</div>
                    </div>
                </button>
            )
        } else {
            searchResult = (
                <button
                    className="selectedSongButton"
                    onClick={handleClick}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '15px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                        }}>
                        <img src={result[2]} alt="" style={{
                            height: '2.5em',
                            borderRadius: '10px',
                            marginRight: '5px',
                            width: '2.5em',
                            zIndex: '999',
                        }}/>
                        <div className={result[0].length > 15 ? 'scrollingSongTitle' : 'songTitle'}>{result[0]}</div>
                    </div>
                </button>
            )
        }
    } else {
        if (result[1].includes("playlist")) {
            searchResult = (
                <button
                    className="playlistButton"
                    onClick={handleClick}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '15px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                        }}>
                        <img src={result[2]} alt="" style={{
                            height: '2.5em',
                            borderRadius: '10px',
                            marginRight: '5px',
                            width: '2.5em',
                            zIndex: '999',
                        }}/>
                        <div className="songTitle">{result[0]}</div>
                    </div>
                </button>
            )
        } else {
            searchResult = (
                <button
                    className="songButton"
                    onClick={handleClick}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '15px',
                            fontWeight: 'bolder',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                        }}>
                        <img src={result[2]} alt="" style={{
                            height: '2.5em',
                            borderRadius: '10px',
                            marginRight: '5px',
                            width: '2.5em',
                            zIndex: '999',
                        }}/>
                        <div className="songTitle">{result[0]}</div>
                    </div>
                </button>
            )
        }
    }

    return searchResult
}

export default SearchResult