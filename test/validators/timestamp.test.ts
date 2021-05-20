import { cloneDeep } from 'lodash';
import { validator } from '../../src';

const defaultData = {
  microTime: new Date().getTime(),
  unixTime: Math.round(new Date().getTime() / 1000),
};
let data: typeof defaultData;

beforeEach(() => {
  data = cloneDeep(defaultData);
});

it('may be undefined', async () => {
  expect(await validator.timestamp.validate(data, 'microTime')).toEqual(undefined);
  expect(await validator.timestamp.optional().validate(data, 'notfound')).toBeUndefined();
  expect(await validator.timestamp.validate(data, 'notfound')).toContain('is required');
});

it('should has default value', async () => {
  const newlyData: Record<string, any> = {};
  const time = new Date().getTime() + 100;

  await validator.timestamp.default(new Date(time)).validate(newlyData, 'time');
  expect(newlyData['time']).toEqual(time);

  await validator.timestamp.default(() => new Date(time)).validate(newlyData, 'time1');
  expect(newlyData['time1']).toEqual(time);

  await validator.timestamp
    .unixTime()
    .default(() => new Date(time))
    .validate(newlyData, 'time2');
  expect(newlyData['time2']).toEqual(Math.floor(time / 1000));
});

it('default is micro time', async () => {
  expect(await validator.timestamp.validate(data, 'microTime')).toEqual(undefined);
  expect(await validator.timestamp.validate(data, 'unixTime')).toContain('timestamp');
});

it('can be treated as unix time', async () => {
  expect(await validator.timestamp.unixTime().validate(data, 'unixTime')).toBeUndefined();
  expect(await validator.timestamp.unixTime().validate(data, 'microTime')).toContain('timestamp');
});

it('can be treated as micro time', async () => {
  expect(await validator.timestamp.milliTime().validate(data, 'microTime')).toBeUndefined();
  expect(await validator.timestamp.milliTime().validate(data, 'unixTime')).toContain('timestamp');
});

it('can convert between unixtime and microtime', async () => {
  await validator.timestamp.milliTime().toUnixTime().validate(data, 'microTime');
  expect(data.microTime.toString()).toMatch(/^\d{10}$/);

  await validator.timestamp.unixTime().toMilliTime().validate(data, 'unixTime');
  expect(data.unixTime.toString()).toMatch(/^\d{13}$/);
});

it('can limit the minimum timestamp', async () => {
  expect(
    await validator.timestamp.min(new Date(data.microTime - 100)).validate(data, 'microTime'),
  ).toBeUndefined();
  expect(
    await validator.timestamp.min(new Date(data.microTime + 100)).validate(data, 'microTime'),
  ).toContain('after');

  expect(
    await validator.timestamp
      .unixTime()
      .min(new Date(data.unixTime * 1000 - 100))
      .validate(data, 'unixTime'),
  ).toBeUndefined();
  expect(
    await validator.timestamp
      .unixTime()
      .min(new Date(data.unixTime * 1000 + 100))
      .validate(data, 'unixTime'),
  ).toContain('after');
});

it('can limit the maximum timestamp', async () => {
  expect(
    await validator.timestamp.max(new Date(data.microTime + 100)).validate(data, 'microTime'),
  ).toBeUndefined();
  expect(
    await validator.timestamp.max(new Date(data.microTime - 100)).validate(data, 'microTime'),
  ).toContain('before');

  expect(
    await validator.timestamp
      .unixTime()
      .max(new Date(data.unixTime * 1000 + 100))
      .validate(data, 'unixTime'),
  ).toBeUndefined();
  expect(
    await validator.timestamp
      .unixTime()
      .max(new Date(data.unixTime * 1000 - 100))
      .validate(data, 'unixTime'),
  ).toContain('before');
});
