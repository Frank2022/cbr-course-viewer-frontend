import React from 'react';
import { Select, DatePicker } from 'antd';
import moment from "moment";
import env from "react-dotenv";

import 'antd/dist/antd.css'
import './App.css';

const { Option } = Select;

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      availableCurrencies: [],
      targetCurrency: 'USD',
      baseCurrency: 'RUR',
      date: moment(),
      course: null,
      isReady: false,
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    fetch(env.CBR_COURSE_VIEWER_BACKEND_DOMAIN + '/availableCurrencies')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.setState({
          availableCurrencies: data.currencies.sort((a, b) => a.localeCompare(b)),
          isReady: true,
        }, () => {
          this.calculateCourse();
        })
      });
  }

  calculateCourse() {
    this.setState({
      isLoading: true,
    }, () => {
      fetch(
        env.CBR_COURSE_VIEWER_BACKEND_DOMAIN + '/course/'
        + this.state.targetCurrency +'/'
        + this.state.baseCurrency + '/'
        + this.state.date.format('YYYY-MM-DD')
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.setState({
            course: data.course || null,
            error: data.error || null,
            isLoading: false,
          })
        });
    });
  }

  renderCurrencySelect(currencyStateField, currencyInputLabel) {
    return (
      <div className="input-wrap">
        <label>{currencyInputLabel}</label>
        <Select
          defaultValue={this.state[currencyStateField]}
          size="large"
          onChange={(value) => {
            this.setState({
              [currencyStateField]: value,
            }, () => {
              this.calculateCourse();
            });
          }}
        >
          {this.state.availableCurrencies.map((currency) => {
            return (
              <Option
                key={currencyStateField + currency}
                value={currency}
              >
                {currency}
                {currency === 'RUR' ? (<small>since 1994</small>) : ''}
                {currency === 'RUB' ? (<small>since 2001</small>) : ''}
              </Option>
            );
          })}
        </Select>
      </div>
    );
  }

  render() {
    return (
      <div className={'app ' + (this.state.isLoading ? 'loading ' : '') + (!this.state.isReady ? 'not-ready ' : '')}>
        <div className="inputs">
          {this.renderCurrencySelect('targetCurrency', 'Target Currency')}
          {this.renderCurrencySelect('baseCurrency', 'Base Currency')}
          <div className="input-wrap">
            <label>Date</label>
            <DatePicker
              defaultValue={this.state.date}
              format={'DD.MM.YYYY'}
              allowClear={false}
              size="large"
              disabledDate={(current) => {
                return current && (current > moment().endOf('day') || current < moment('1992-02-01'));
              }}
              onChange={(date) => {
                this.setState({ date }, () => {
                  this.calculateCourse();
                });
              }}
            />
          </div>
        </div>
        {this.state.error ? (
          <div className="error">{this.state.error}</div>
        ) : (
          <div className="result">
            1 {this.state.targetCurrency} = {this.state.course || 'X'} {this.state.baseCurrency}
          </div>
        )}
      </div>
    );
  }
}

export default App;
