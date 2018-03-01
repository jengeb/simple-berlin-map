import { h, Component } from 'preact'

import BalanceGauge from '@components/BalanceGauge/BalanceGauge.jsx'
import colors from '@shared/styles/colors.sass'
import _ from './styles.sass'

export default class SchoolInfo extends Component {
  render (props) {
    const {
      name,
      type,
      legal_status: legalStatus,
      address,
      statistics,
      entryURL
    } = props.properties

    const { 'Jahrgangsstufen': pupils } = statistics

    const metrics = [
      {
        title: 'Vertretungsunterricht:',
        percent: statistics.Vertretungsunterricht && statistics.Vertretungsunterricht.values['Vertretung von Unterricht']
      },
      {
        title: 'Ausgefallener Unterricht:',
        percent: statistics.Vertretungsunterricht && statistics.Vertretungsunterricht.values['Ausfall von Unterricht']
      },
      {
        title: 'Schüler, die zu Hause nicht Deutsch sprechen:',
        percent: statistics['Nichtdeutsche Herkunftssprache'] && statistics['Nichtdeutsche Herkunftssprache'].values.Insgesamt
      },
      {
        title: 'Unentschuldigte Fehltage:',
        percent: statistics.Fehlzeiten && statistics.Fehlzeiten.values
      }
    ]

    return <div class={_.schoolInfo}>
      <div class={_.titleWrapper}>
        <div>
          <h2 class={_.title}>{name}</h2>
          <p class={_.schooltype}>
            {type === 'Gymnasien' ? 'Gymnasium' : type}
            { legalStatus && <span> {legalStatus}</span> }
          </p>
          <p class={_.address}>
            { address.street && `${address.street}, ${address.postcode} ${address.city}` }
          </p>
        </div>
        <dl class={_.source}>
          <dt>Quelle:</dt>
          <dd><a href={entryURL} target='_blank'>berlin.de</a></dd>
        </dl>
      </div>

      <dl class={_.metrics}>
        <div class={_.metric}>
          <dt>Schülerzahl:</dt>
          <dd>
            <span class={_.pupils}>
              {pupils ? pupils.values.Insgesamt : 'n.a.'}
            </span>
          </dd>
        </div>
        <div class={_.metric}>
          <dt>Schülerinnen / Schüler:</dt>
          <dd>
            { pupils
              ? <BalanceGauge ratio={pupils.values.Schülerinnen / 100}
                // barColors={['rgb(199, 68, 111)', 'rgb(98, 107, 202)']}
                barColors={[colors.red, colors.darkGrey]}
                text={() => `${pupils.values.Schülerinnen}% / ${pupils.values.Schüler}%`} />
              : <span class={_.noValue}>n.a.</span>
            }
          </dd>
        </div>
        { metrics.map(metric =>
          <div class={_.metric}>
            <dt>{metric.title}</dt>
            <dd>
              { metric.percent
                ? <BalanceGauge ratio={metric.percent / 100}
                  text={() => `${metric.percent}%`} />
                : <span class={_.noValue}>n.a.</span>
              }
            </dd>
          </div>
        )}
      </dl>
    </div>
  }
}
