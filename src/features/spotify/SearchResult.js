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
                    <div className={result[0].length > 15 ? 'scrollingSongTitle' : 'songTitle'}
                        style={{
                            cursor: 'pointer',
                            width: 'fit-content',
                            margin: 'auto',
                        }}>
                        {result[0]}
                    </div>
                </button>
            )
        } else {
            searchResult = (
                <button
                    className="selectedSongButton"
                    onClick={handleClick}>
                    <div className={result[0].length > 15 ? 'scrollingSongTitle' : 'songTitle'}
                        style={{
                            cursor: 'pointer',
                            width: 'fit-content',
                            margin: 'auto',
                        }}>
                        {result[0]}
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
                    <div className={'songTitle'}
                        style={{
                            cursor: 'pointer',
                            width: 'fit-content',
                            margin: 'auto',
                        }}>
                        {result[0]}
                    </div>
                </button>
            )
        } else {
            searchResult = (
                <button
                    className="songButton"
                    onClick={handleClick}>
                    <div className={'songTitle'}
                        style={{
                            cursor: 'pointer',
                            width: 'fit-content',
                            margin: 'auto',
                        }}>
                        {result[0]}
                    </div>
                </button>
            )
        }
    }

    return searchResult
}

export default SearchResult