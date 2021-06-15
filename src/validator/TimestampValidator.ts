import { Validator, ValidatorOptions } from './Validator';

type CustomDate = Date | (() => Date);

interface TimestampOptions<T> extends ValidatorOptions<T> {
  type?: 'unix' | 'milliTime';
  minDate?: CustomDate;
  maxDate?: CustomDate;
  convertTo?: 'unix' | 'milliTime';
}

export interface TimestampDataType {
  type: 'number';
  validator: 'timestamp';
}

const unixPattern = /^\d{10}$/;
const microPattern = /^\d{13}$/;

export class TimestampValidator<T = number> extends Validator<TimestampOptions<T>> {
  /**
   * Timestamp with seconds like: 1620367239
   */
  public unixTime(): this {
    this.config.type = 'unix';
    return this;
  }

  /**
   * Timestamp with milliseconds like: 1620367239118
   *
   * This is default setting.
   */
  public milliTime(): this {
    this.config.type = 'milliTime';
    return this;
  }

  public toUnixTime(): this {
    this.config.convertTo = 'unix';
    return this;
  }

  public toMilliTime(): this {
    this.config.convertTo = 'milliTime';
    return this;
  }

  public min(date: Date | (() => Date)): this {
    this.config.minDate = date;
    return this;
  }

  public max(date: Date | (() => Date)): this {
    this.config.maxDate = date;
    return this;
  }

  declare optional: () => TimestampValidator<T | undefined>;

  declare default: (timestamp: Date | (() => Date)) => TimestampValidator<NonNullable<T>>;

  declare transform: <T1>(fn: (timestamp: T) => Promise<T1> | T1) => TimestampValidator<T1>;

  protected override transformDefaultValue(value: CustomDate | undefined) {
    const timestamp = TimestampValidator.date2timestamp(value);

    if (timestamp !== undefined && this.config.type === 'unix') {
      return Number(timestamp.toString().substr(0, 10));
    }

    return timestamp;
  }

  protected getDataType(): TimestampDataType {
    return {
      type: 'number',
      validator: 'timestamp',
    };
  }

  protected async validateValue(
    data: Record<string, any>,
    key: string,
    superKeys: string[],
  ): Promise<string | void> {
    const { type = 'milliTime', convertTo, maxDate, minDate } = this.config;
    const isMicroTime = type === 'milliTime';
    const isUnixTime = !isMicroTime;
    const pattern = isMicroTime ? microPattern : unixPattern;
    let strValue = String(data[key]);
    let numValue = Number(strValue);

    if (!pattern.test(strValue)) {
      return `${this.getLabel(key, superKeys)} must be a timestamp`;
    }

    data[key] = numValue;

    if (isUnixTime) {
      strValue += '000';
      numValue = Number(strValue);
    }

    const min = TimestampValidator.date2timestamp(minDate);
    if (min !== undefined && numValue < min) {
      return `${this.getLabel(key, superKeys)} must be after ${new Date(min).toLocaleString()}`;
    }

    const max = TimestampValidator.date2timestamp(maxDate);
    if (max !== undefined && numValue > max) {
      return `${this.getLabel(key, superKeys)} must be before ${new Date(max).toLocaleString()}`;
    }

    // Last step, we don't reassign to local value
    if (isMicroTime && convertTo === 'unix') {
      data[key] = Number(strValue.substr(0, 10));
    } else if (isUnixTime && convertTo === 'milliTime') {
      data[key] = numValue;
    }
  }

  protected static date2timestamp(date?: CustomDate) {
    if (!date) {
      return;
    }

    if (typeof date === 'function') {
      return date().getTime();
    }

    return date.getTime();
  }
}
