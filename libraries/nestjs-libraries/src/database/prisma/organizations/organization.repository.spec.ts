import { Prisma } from '@prisma/client';
import { OrganizationRepository } from './organization.repository';

// Billing records the purge keeps, see purgeOrganization
const KEPT = ['Organization', 'Subscription', 'UsedCodes'];
// shortcut: marketplace models nothing writes any more, not purged
const SKIPPED = [
  'MessagesGroup',
  'Orders',
  'OrderItems',
  'PayoutProblems',
  'Messages',
];

const delegate = (model: string) => model[0].toLowerCase() + model.slice(1);

describe('OrganizationRepository.purgeOrganization', () => {
  const calls: string[] = [];

  beforeAll(async () => {
    const tx = new Proxy(
      {},
      {
        get: (_, model: string) =>
          new Proxy(
            {},
            {
              get: (__, op: string) => async () => {
                calls.push(`${model}.${op}`);
                return op === 'findMany' ? [] : { count: 0 };
              },
            }
          ),
      }
    );
    const transaction = { model: { $transaction: (fn: any) => fn(tx) } };
    const repo = new (OrganizationRepository as any)(
      ...Array(6).fill({}),
      transaction
    );
    await repo.purgeOrganization('org');
  });

  const deleted = (model: string) =>
    calls.indexOf(`${delegate(model)}.deleteMany`);

  // required foreign keys, child model -> parent model
  const required = Prisma.dmmf.datamodel.models.flatMap((model) =>
    model.fields
      .filter(
        (field) =>
          field.kind === 'object' &&
          field.isRequired &&
          !field.isList &&
          field.relationFromFields?.length
      )
      .map((field) => ({ child: model.name, parent: field.type }))
  );

  it('deletes every child before its parent', () => {
    for (const { child, parent } of required) {
      if (deleted(parent) === -1 || SKIPPED.includes(child)) {
        continue;
      }
      expect({ child, parent, before: deleted(child) !== -1 }).toEqual({
        child,
        parent,
        before: true,
      });
      expect(deleted(child)).toBeLessThan(deleted(parent));
    }
  });

  it('purges or deliberately keeps every model owned by an organization', () => {
    for (const { child } of required.filter(
      (r) => r.parent === 'Organization'
    )) {
      if (!KEPT.includes(child) && !SKIPPED.includes(child)) {
        expect({ child, deleted: deleted(child) !== -1 }).toEqual({
          child,
          deleted: true,
        });
      }
    }
  });

  it('keeps billing records and anonymizes the organization last', () => {
    for (const model of KEPT) {
      expect(deleted(model)).toBe(-1);
    }
    expect(calls[calls.length - 1]).toBe('organization.update');
  });
});
