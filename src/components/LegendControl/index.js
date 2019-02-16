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
      unit,
      ...rest
    } = this.props

    return <div {...this.props}>
      <div class={className}>
        <div style='padding-bottom:5px;'>
            {title}
        </div>
        {grades.map((grade, i) =>
          i < grades.length - 1 ?  
          <div style='padding-bottom:5px;'>
            <i style={{ backgroundColor: colors[i]}}></i> {grades[i]}-{grades[i+1]} %
          </div>
          : null
        )}
      </div>
    </div>
  }
}
