import ReactSlider from "react-slider"
import {useEffect, useState} from "react"

const VolumeSlider = ({volume, setVolume, setUsingVolumeSlider, setIsVolumeSliderFocused, resetVolumeSliderFocus, cancelVolumeSliderCooldown}) => {
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

    return (
        <ReactSlider
            min={0}
            max={100}
            className="customSlider"
            trackClassName={windowWidth <= 1000 ? "customSlider-jumbotrack" : "customSlider-track"}
            thumbClassName={windowWidth <= 1000 ? "customSlider-jumbothumb" : "customSlider-thumb"}
            // renderThumb={(props, state) => (
            //     <div style={{
            //             position: 'absolute',
            //             touchAction: 'none',
            //             zIndex: '1',
            //             left: `${state.valueNow}%`,
            //         }}>
            //         <div className="customSlider-thumb" />
            //     </div>
            // )}
            value={volume}
            onChange={(newValue) => {
                cancelVolumeSliderCooldown()
                setIsVolumeSliderFocused(true)
                setVolume(newValue)
                resetVolumeSliderFocus()
            }}
            onBeforeChange={() => {
                setUsingVolumeSlider(true)
            }}
            onAfterChange={() => {
                setUsingVolumeSlider(false)
            }}
        />
    )
}

export default VolumeSlider
