import { h, Component } from 'preact'
import Slider from '@shared/components/Slider'
import _ from './styles.sass'

export default class Detail extends Component {
  getSlide = (feature) => {
    if (!feature) return null

    return <div class={_.content}>
      <h2 class={_.title}>{feature.properties.title}</h2>
      <p class={_.description}>
        {feature.properties.adr_plz_ort}-{feature.properties.stadtteil}
      </p>
    </div>
  }

  render (props) {
    const { markers, selectedMarkerIndex, isTouchEnabled } = props
    const selectedMarker = markers[selectedMarkerIndex]
    const hasMarker = selectedMarker !== undefined

    const className = `${_.detail} ${props.class} ${hasMarker && _.hasMarker}`

    if (!hasMarker) return <div class={className}><p class={_.loadingText}>lädt…</p></div>

    const silderProps = {
      onForwardNavigation: () => {
        this.context.actions.selectMarker({ byIndex: selectedMarkerIndex + 1 })
      },
      onBackwardNavigation: () => {
        this.context.actions.selectMarker({ byIndex: selectedMarkerIndex - 1 })
      },
      previousSlide: this.getSlide(markers[selectedMarkerIndex - 1]),
      currentSlide: this.getSlide(markers[selectedMarkerIndex]),
      nextSlide: this.getSlide(markers[selectedMarkerIndex + 1]),
      canHaveFocus: !isTouchEnabled
    }

    return <div class={className}>
      <Slider {...silderProps} />

    </div>
  }
}
