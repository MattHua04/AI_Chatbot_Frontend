const SearchResult = ({ result, setSong, setInput, setShowSearchBar, searchResults, setShowSearchResults, selectedSearchResult, setSelectedSearchResult }) => {
    const handleClick = () => {
        setSong(result)
        setInput('')
        setShowSearchBar(false)
        setShowSearchResults(false)
        setSelectedSearchResult(0)
    }

    let searchResult
    if (selectedSearchResult === searchResults.indexOf(result)) {
        searchResult = (
            <button
                className="selectedSongButton"
                onClick={handleClick}>
                <div className={result.length > 15 ? 'scrollingSongTitle' : 'songTitle'}
                    style={{
                        cursor: 'pointer',
                        width: 'fit-content',
                        margin: 'auto',
                    }}>
                    {result}
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
                    {result}
                </div>
            </button>
        )
    }

    return searchResult
}

export default SearchResult