import {
  PrismaRepository,
  PrismaTransaction,
} from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { appDomain } from '@gitroom/helpers/utils/app.domain';
import { Role, ShortLinkPreference, SubscriptionTier } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { makeSecureId } from '@gitroom/nestjs-libraries/services/make.secure.id';

@Injectable()
export class OrganizationRepository {
  constructor(
    private _organization: PrismaRepository<'organization'>,
    private _userOrg: PrismaRepository<'userOrganization'>,
    private _user: PrismaRepository<'user'>,
    private _media: PrismaRepository<'media'>,
    private _clippingClip: PrismaRepository<'clippingClip'>,
    private _post: PrismaRepository<'post'>,
    private _transaction: PrismaTransaction
  ) {}

  createMaxUser(id: string, name: string, saasName: string, email: string) {
    return this._organization.model.organization.create({
      select: {
        id: true,
        apiKey: true,
      },
      data: {
        name: name ? `${name}###${id}` : `Unnamed User###${id}`,
        apiKey: AuthService.fixedEncryption(makeSecureId(20)),
        isTrailing: false,
        subscription: {
          create: {
            totalChannels: 1000000,
            subscriptionTier: 'ULTIMATE',
            isLifetime: true,
            period: 'YEARLY',
          },
        },
        users: {
          create: {
            role: Role.SUPERADMIN,
            user: {
              create: {
                activated: true,
                email: email
                  ? email.split('@').join(`+${saasName}@`)
                  : `${saasName}+` +
                    makeId(10) +
                    '@' +
                    appDomain(),
                name: name ? `${name}###${id}` : `Unnamed User###${id}`,
                providerName: 'LOCAL',
                password: AuthService.hashPassword(makeSecureId(500)),
                timezone: 0,
              },
            },
          },
        },
      },
    });
  }

  getOrgByApiKey(api: string) {
    return this._organization.model.organization.findFirst({
      where: {
        apiKey: api,
        deletedAt: null,
      },
      include: {
        subscription: {
          select: {
            subscriptionTier: true,
            totalChannels: true,
            isLifetime: true,
          },
        },
      },
    });
  }

  getCount() {
    return this._organization.model.organization.count();
  }

  getSuperAdminUser(orgId: string) {
    return this._userOrg.model.userOrganization.findFirst({
      where: {
        organizationId: orgId,
        disabled: false,
        user: {
          isSuperAdmin: true,
          deletedAt: null,
        },
      },
    });
  }

  getPrivilegedNonSuperAdminUser(orgId: string) {
    return this._userOrg.model.userOrganization.findFirst({
      where: {
        organizationId: orgId,
        disabled: false,
        role: {
          in: [Role.SUPERADMIN, Role.ADMIN],
        },
        user: {
          isSuperAdmin: false,
          deletedAt: null,
        },
      },
    });
  }

  getUserOrg(id: string) {
    return this._userOrg.model.userOrganization.findFirst({
      where: {
        id,
      },
      select: {
        user: true,
        organization: {
          include: {
            users: {
              select: {
                id: true,
                disabled: true,
                role: true,
                userId: true,
              },
            },
            subscription: {
              select: {
                subscriptionTier: true,
                totalChannels: true,
                isLifetime: true,
              },
            },
          },
        },
      },
    });
  }

  getImpersonateUser(name: string) {
    return this._userOrg.model.userOrganization.findMany({
      where: {
        OR: [
          {
            organizationId: {
              contains: name,
            },
          },
          {
            organization: {
              OR: [
                {
                  paymentId: {
                    equals: name,
                  },
                },
                {
                  subscription: {
                    identifier: {
                      equals: name,
                    },
                  },
                },
                {
                  Integration: {
                    some: {
                      id: name,
                    },
                  },
                },
                {
                  post: {
                    some: {
                      id: name,
                    },
                  },
                },
              ],
            },
          },
          {
            user: {
              OR: [
                {
                  name: {
                    contains: name,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: name,
                    mode: 'insensitive',
                  },
                },
                {
                  id: {
                    contains: name,
                  },
                },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        role: true,
        disabled: true,
        organization: {
          select: {
            id: true,
            name: true,
            paymentId: true,
            deletedAt: true,
            subscription: {
              select: {
                subscriptionTier: true,
                identifier: true,
                isLifetime: true,
                period: true,
                cancelAt: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            activated: true,
            providerName: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  updateApiKey(orgId: string) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        apiKey: AuthService.fixedEncryption(makeSecureId(20)),
      },
    });
  }

  async getOrgsByUserId(userId: string) {
    return this._organization.model.organization.findMany({
      where: {
        deletedAt: null,
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          where: {
            userId,
          },
          select: {
            disabled: true,
            role: true,
          },
        },
        subscription: {
          select: {
            subscriptionTier: true,
            totalChannels: true,
            isLifetime: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getOrgById(id: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id,
      },
    });
  }

  getOrgByIdWithSubscription(id: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id,
      },
      include: {
        subscription: {
          select: {
            subscriptionTier: true,
            totalChannels: true,
            isLifetime: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getAccountOverview(orgId: string) {
    const [organization, members] = await Promise.all([
      this._organization.model.organization.findUnique({
        where: {
          id: orgId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          deletedAt: true,
          allowTrial: true,
          isTrailing: true,
          subscription: {
            select: {
              subscriptionTier: true,
              period: true,
              identifier: true,
              totalChannels: true,
              isLifetime: true,
              cancelAt: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
            },
          },
        },
      }),
      this._userOrg.model.userOrganization.findMany({
        where: {
          organizationId: orgId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          role: true,
          disabled: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              activated: true,
              providerName: true,
              lastOnline: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    if (!organization) {
      return null;
    }

    const owner = members.find((member) => member.role === Role.SUPERADMIN);
    const lastOnlineMax = members.reduce<Date | null>(
      (latest, member) =>
        !latest || member.user.lastOnline > latest
          ? member.user.lastOnline
          : latest,
      null
    );

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        createdAt: organization.createdAt,
        deletedAt: organization.deletedAt,
        allowTrial: organization.allowTrial,
        isTrailing: organization.isTrailing,
      },
      subscription: organization.subscription || null,
      owner: owner
        ? {
            ...owner.user,
            role: owner.role,
            memberSince: owner.createdAt,
          }
        : null,
      users: {
        total: members.length,
        activated: members.filter((member) => member.user.activated).length,
        disabled: members.filter((member) => member.disabled).length,
        lastOnlineMax,
      },
    };
  }

  getUsersByEmail(email: string) {
    return this._user.model.user.findMany({
      where: {
        email,
      },
    });
  }

  async addUserToOrg(
    userId: string,
    id: string,
    orgId: string,
    role: 'USER' | 'ADMIN'
  ) {
    const checkIfInviteExists = await this._user.model.user.findFirst({
      where: {
        inviteId: id,
      },
    });

    if (checkIfInviteExists) {
      return false;
    }

    const checkIfMemberExists =
      await this._userOrg.model.userOrganization.findFirst({
        where: {
          userId,
          organizationId: orgId,
        },
      });

    if (checkIfMemberExists) {
      return false;
    }

    const checkForSubscription =
      await this._organization.model.organization.findFirst({
        where: {
          id: orgId,
        },
        select: {
          subscription: true,
        },
      });

    if (
      process.env.STRIPE_PUBLISHABLE_KEY &&
      checkForSubscription?.subscription?.subscriptionTier ===
        SubscriptionTier.STANDARD
    ) {
      return false;
    }

    const create = await this._userOrg.model.userOrganization.create({
      data: {
        role,
        userId,
        organizationId: orgId,
      },
    });

    await this._user.model.user.update({
      where: {
        id: userId,
      },
      data: {
        inviteId: id,
      },
    });

    return create;
  }

  async createOrgAndUser(
    body: Omit<CreateOrgUserDto, 'providerToken' | 'ageConfirmed'> & { providerId?: string },
    hasEmail: boolean,
    ip: string,
    userAgent: string
  ) {
    return this._organization.model.organization.create({
      data: {
        name: body.company,
        apiKey: AuthService.fixedEncryption(makeSecureId(20)),
        allowTrial: true,
        isTrailing: true,
        users: {
          create: {
            role: Role.SUPERADMIN,
            user: {
              create: {
                activated: body.provider !== 'LOCAL' || !hasEmail,
                email: body.email,
                password: body.password
                  ? AuthService.hashPassword(body.password)
                  : '',
                providerName: body.provider,
                providerId: body.providerId || '',
                timezone: 0,
                ip,
                agent: userAgent,
              },
            },
          },
        },
      },
      select: {
        id: true,
        users: {
          select: {
            user: true,
          },
        },
      },
    });
  }

  getOrgByCustomerId(customerId: string) {
    return this._organization.model.organization.findFirst({
      where: {
        paymentId: customerId,
      },
    });
  }

  async setStreak(organizationId: string, type: 'start' | 'end') {
    try {
      await this._organization.model.organization.update({
        where: {
          id: organizationId,
          ...(type === 'start'
            ? {
                streakSince: null,
              }
            : {}),
        },
        data: {
          ...(type === 'end' ? { streakSince: null } : {}),
          ...(type === 'start' ? { streakSince: new Date() } : {}),
        },
      });
    } catch (err) {}
  }

  async getLastPublishDate(organizationId: string) {
    // Still publishing, or about to: a post scheduled exactly a day after the
    // previous one must not end the streak
    const lookahead = Date.now() + 5 * 60 * 1000;
    const [org, recurring] = await Promise.all([
      this._organization.model.organization.findUnique({
        where: {
          id: organizationId,
        },
        select: {
          post: {
            where: {
              deletedAt: null,
              parentPostId: null,
              intervalInDays: null,
              OR: [
                { state: 'PUBLISHED' },
                { state: 'QUEUE', publishDate: { lte: new Date(lookahead) } },
              ],
            },
            orderBy: {
              publishDate: 'desc',
            },
            take: 1,
            select: {
              publishDate: true,
            },
          },
        },
      }),
      // Recurring posts keep their first publishDate and are republished on
      // the interval grid, count their latest occurrence instead
      this._organization.model.organization.findUnique({
        where: {
          id: organizationId,
        },
        select: {
          post: {
            where: {
              deletedAt: null,
              parentPostId: null,
              intervalInDays: { not: null },
              state: { in: ['PUBLISHED', 'QUEUE'] },
              publishDate: { lte: new Date(lookahead) },
            },
            select: {
              publishDate: true,
              intervalInDays: true,
            },
          },
        },
      }),
    ]);

    const dates = [
      ...(org?.post || []).map((p) => p.publishDate.getTime()),
      ...(recurring?.post || []).map((p) => {
        const first = p.publishDate.getTime();
        const interval = p.intervalInDays * 24 * 60 * 60 * 1000;
        return first + Math.floor((lookahead - first) / interval) * interval;
      }),
    ];

    // Never in the future, the streak workflow sleeps until a day after it
    return dates.length ? Math.min(Math.max(...dates), Date.now()) : null;
  }

  async getTeam(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        users: {
          select: {
            role: true,
            user: {
              select: {
                email: true,
                id: true,
                sendSuccessEmails: true,
                sendFailureEmails: true,
                sendStreakEmails: true,
              },
            },
          },
        },
      },
    });
  }

  getAllUsersOrgs(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        users: {
          select: {
            user: {
              select: {
                email: true,
                id: true,
                sendSuccessEmails: true,
                sendFailureEmails: true,
              },
            },
          },
        },
      },
    });
  }

  deleteOrganization(orgId: string) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  getOrganizationsToPurge(deletedBefore: Date, take: number, skip: number) {
    return this._organization.model.organization.findMany({
      where: {
        deletedAt: { lt: deletedBefore },
        purgedAt: null,
      },
      // stable order, the caller skips the ones that failed
      orderBy: [{ deletedAt: 'asc' }, { id: 'asc' }],
      select: { id: true },
      take,
      skip,
    });
  }

  async getOrganizationFiles(orgId: string) {
    const [media, clips] = await Promise.all([
      this._media.model.media.findMany({
        where: { organizationId: orgId },
        select: { path: true, thumbnail: true },
      }),
      this._clippingClip.model.clippingClip.findMany({
        where: { clipping: { organizationId: orgId } },
        select: { path: true, thumbnail: true },
      }),
    ]);

    return [...media, ...clips]
      .flatMap((file) => [file.path, file.thumbnail])
      .filter((path): path is string => !!path);
  }

  // Paths are client-settable (thumbnail URL, /media/save-media name) and
  // storage deletes by the last segment, so a key another organization still
  // references is never ours to delete
  async isFileUsedElsewhere(orgId: string, path: string) {
    const key = path.split('/').pop();
    if (!key) {
      return true;
    }

    const suffix = { endsWith: `/${key}` };
    const [media, clips, posts] = await Promise.all([
      this._media.model.media.count({
        where: {
          organizationId: { not: orgId },
          OR: [{ name: key }, { path: suffix }, { thumbnail: suffix }],
        },
      }),
      this._clippingClip.model.clippingClip.count({
        where: {
          clipping: { organizationId: { not: orgId } },
          OR: [{ path: suffix }, { thumbnail: suffix }],
        },
      }),
      this._post.model.post.count({
        where: {
          organizationId: { not: orgId },
          image: { contains: key },
        },
      }),
    ]);

    return media + clips + posts > 0;
  }

  // Hard-deletes everything a soft-deleted organization owns, children first
  // because no relation cascades. Kept on purpose: the organization row
  // (anonymized, its paymentId is the Stripe customer), its Subscription and
  // UsedCodes, which are billing records with no personal data
  purgeOrganization(orgId: string) {
    const byOrg = { organizationId: orgId };
    const byPost = { post: byOrg };
    const byIntegration = { integration: byOrg };

    return this._transaction.model.$transaction(
      async (tx) => {
        // rows of other organizations that point at what is about to go
        await tx.user.updateMany({
          where: { picture: byOrg },
          data: { pictureId: null },
        });
        await tx.socialMediaAgency.updateMany({
          where: { logo: byOrg },
          data: { logoId: null },
        });
        await tx.oAuthApp.updateMany({
          where: { picture: byOrg },
          data: { pictureId: null },
        });
        await tx.post.updateMany({
          where: { submittedForOrganizationId: orgId },
          data: { submittedForOrganizationId: null },
        });

        const comments = { OR: [byOrg, byPost] };
        await tx.comments.updateMany({
          where: comments,
          data: { parentId: null },
        });
        await tx.comments.deleteMany({ where: comments });
        await tx.errors.deleteMany({ where: { OR: [byOrg, byPost] } });
        await tx.tagsPosts.deleteMany({
          where: { OR: [byPost, { tag: { orgId } }] },
        });
        await tx.post.updateMany({
          where: byOrg,
          data: { parentPostId: null },
        });
        // shortcut: marketplace rows (MessagesGroup, Orders, OrderItems,
        // PayoutProblems) are not removed, nothing writes them any more; if one
        // exists the transaction fails, is logged and the organization is skipped
        await tx.post.deleteMany({ where: byOrg });
        await tx.tags.deleteMany({ where: { orgId } });

        await tx.integrationsWebhooks.deleteMany({
          where: { OR: [{ webhook: byOrg }, byIntegration] },
        });
        await tx.webhooks.deleteMany({ where: byOrg });
        await tx.exisingPlugData.deleteMany({ where: byIntegration });
        await tx.plugs.deleteMany({ where: { OR: [byOrg, byIntegration] } });
        await tx.integration.deleteMany({ where: byOrg });
        await tx.customer.deleteMany({ where: { orgId } });

        await tx.clippingClip.deleteMany({ where: { clipping: byOrg } });
        await tx.clipping.deleteMany({ where: byOrg });

        await tx.oAuthSelfHostedAuthorization.deleteMany({
          where: { oauthApp: byOrg },
        });
        await tx.oAuthAuthorization.deleteMany({
          where: { OR: [byOrg, { oauthApp: byOrg }] },
        });
        await tx.oAuthApp.deleteMany({ where: byOrg });
        await tx.media.deleteMany({ where: byOrg });

        await tx.signatures.deleteMany({ where: byOrg });
        await tx.sets.deleteMany({ where: byOrg });
        await tx.autoPost.deleteMany({ where: byOrg });
        await tx.thirdParty.deleteMany({ where: byOrg });
        await tx.gitHub.deleteMany({ where: byOrg });
        await tx.notifications.deleteMany({ where: byOrg });
        await tx.credits.deleteMany({ where: byOrg });
        await tx.userOrganization.deleteMany({ where: byOrg });

        // agent chat memory, keyed by the organization id
        const threads = (
          await tx.mastra_threads.findMany({
            where: { resourceId: orgId },
            select: { id: true },
          })
        ).map((thread) => thread.id);
        await tx.mastra_messages.deleteMany({
          where: {
            OR: [{ thread_id: { in: threads } }, { resourceId: orgId }],
          },
        });
        await tx.mastra_thread_state.deleteMany({
          where: { threadId: { in: threads } },
        });
        await tx.mastra_observational_memory.deleteMany({
          where: { resourceId: orgId },
        });
        await tx.mastra_threads.deleteMany({ where: { resourceId: orgId } });
        await tx.mastra_resources.deleteMany({ where: { id: orgId } });

        await tx.organization.update({
          where: { id: orgId },
          data: {
            name: 'Deleted organization',
            description: null,
            apiKey: null,
            purgedAt: new Date(),
          },
          select: { id: true },
        });
      },
      // a large workspace has many rows, the default 5s is not enough
      { timeout: 300000 }
    );
  }

  async deleteTeamMember(orgId: string, userId: string) {
    return this._userOrg.model.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
  }

  disableOrEnableNonSuperAdminUsers(orgId: string, disable: boolean) {
    return this._userOrg.model.userOrganization.updateMany({
      where: {
        organizationId: orgId,
        role: {
          not: Role.SUPERADMIN,
        },
      },
      data: {
        disabled: disable,
      },
    });
  }

  getShortlinkPreference(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        shortlink: true,
      },
    });
  }

  updateShortlinkPreference(orgId: string, shortlink: ShortLinkPreference) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        shortlink,
      },
    });
  }

  getApprovalPreference(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        requireApproval: true,
      },
    });
  }

  updateApprovalPreference(orgId: string, requireApproval: boolean) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        requireApproval,
      },
      select: {
        requireApproval: true,
      },
    });
  }
}
