import { validator } from '../../src';

const defaultData: {
  [key: string]: string[];
} = {
  uuid1: [
    'b6dbd93e-a941-11eb-90dc-52540006f7b4',
    'b6dc3014-a941-11eb-a763-52540006f7b4',
    'b6dc3212-a941-11eb-b42c-52540006f7b4',
    'b6dc335c-a941-11eb-8839-52540006f7b4',
    'b6dc3488-a941-11eb-9de9-52540006f7b4',
  ],
  uuid2: [
    '000001f4-a941-21eb-9c00-52540006f7b4',
    '000001f4-a941-21eb-9e00-52540006f7b4',
    '000001f4-a941-21eb-b100-52540006f7b4',
    '000001f4-a941-21eb-b200-52540006f7b4',
    '000001f4-a941-21eb-8500-52540006f7b4',
  ],
  uuid3: [
    'b1087a1e-5cb3-33e1-aa17-a28bf064153a',
    'b1087a1e-5cb3-33e1-aa17-a28bf064153a',
    'b1087a1e-5cb3-33e1-aa17-a28bf064153a',
    'b1087a1e-5cb3-33e1-aa17-a28bf064153a',
    'b1087a1e-5cb3-33e1-aa17-a28bf064153a',
  ],
  uuid4: [
    '1080a495-f359-48b7-a36e-b23923a45907',
    '8ce303ca-6790-4819-bbdd-0a91b8685050',
    '0618ee14-ed05-4c17-a080-70867eb973be',
    '5341a798-8ad3-4fef-89d2-b2d55ad81f3f',
    '85ed5d49-c571-46eb-9477-9312b6554857',
  ],
  uuid5: [
    '4a1ad067-cd25-5afb-95c4-9327b383f3d5',
    '4a1ad067-cd25-5afb-95c4-9327b383f3d5',
    '4a1ad067-cd25-5afb-95c4-9327b383f3d5',
    '4a1ad067-cd25-5afb-95c4-9327b383f3d5',
    '4a1ad067-cd25-5afb-95c4-9327b383f3d5',
  ],
  uuidall: [
    '4a1ad067-cd25-5afb-95c4-9327b383f3d5',
    '8ce303ca-6790-4819-bbdd-0a91b8685050',
    'b1087a1e-5cb3-33e1-aa17-a28bf064153a',
    '000001f4-a941-21eb-8500-52540006f7b4',
    'b6dbd93e-a941-11eb-90dc-52540006f7b4',
  ],
  invalid: ['23450-s2083', '9900', 'x-099283-s93857-990dk3e99'],
};

it('can recognize different uuid versions', async () => {
  for (let num of ['1', '2', '3', '4', '5', 'all'] as const) {
    for (let uuid of defaultData['uuid' + num]!) {
      const data = { ['uuid' + uuid]: uuid };
      expect(
        await validator.uuid.version(num).validate(data, 'uuid' + uuid),
      ).toEqual(undefined);
    }

    for (let invalidUUID of defaultData.invalid!) {
      const data = { uuid: invalidUUID };
      expect(
        await validator.uuid.version(num).validate(data, 'uuid'),
      ).toContain('uuid');
    }
  }
});
