import { validator } from '../../src';

const defaultData = {
  ip4: ['127.0.0.1', '196.128.1.4', '255.255.255.255', '154.26.96.246'],
  invalidIp4: [
    '256.255.255.255',
    '973.0.0.1',
    '25.2',
    '56.23.144',
    '127.0.555.4',
    '127.0.0.1 ',
    ' 127.0.0.1',
  ],
  ip6: [
    '2001:0db8:3c4d:0015:0000:0000:1a2f:1a2b',
    '2031:0000:1F1F:0000:0000:0100:11A0:ADDF',
    '1080:0:0:0:8:800:200C:417A',
    '1080::8:800:200C:417A',
    'FF01::101',
    '::1',
    '::',
  ],
};

test('ip v4', async () => {
  for (let ip of defaultData.ip4) {
    const data = { ip };
    expect(
      await validator.ip.version('4').validate(data, 'ip'),
    ).toBeUndefined();
  }

  for (let ip of defaultData.invalidIp4) {
    const data = { ip };
    expect(await validator.ip.version('4').validate(data, 'ip')).toContain(
      'ip4',
    );
  }
});

test('ip v6', async () => {
  for (let ip of defaultData.ip6) {
    const data = { ip };
    expect(
      await validator.ip.version('6').validate(data, 'ip'),
    ).toBeUndefined();
  }
});

test('ip v4 + v6', async () => {
  for (let ip of defaultData.ip6.concat(defaultData.ip4)) {
    const data = { ip };
    expect(
      await validator.ip.version('all').validate(data, 'ip'),
    ).toBeUndefined();
  }
});
