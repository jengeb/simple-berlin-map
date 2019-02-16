import ReactDOM from 'react-dom'
import L from 'leaflet'
import { MapControl } from 'react-leaflet'
import { h, Component } from 'preact'
import _ from './styles.sass'

export default class LegendControl extends Component {

  constructor (props) {
    super(props)
  }

  render (props) {
    const className = `${_.info} ${_.legend}`

    const {
      grades, 
      labels,
      colors,
      position,
      title,
      ...rest
    } = this.props

    return <div {...this.props}>
      <div class={className}>
        <div style='padding-bottom:5px;'>
            {title}
        </div>
        {grades.map((grade, i) =>
          <div style='padding-bottom:5px;'>
            <i style={{ backgroundColor: colors[i]}}></i> {grade} {labels[i]}
          </div>
        )} 
      </div>
    </div>
  }
}
