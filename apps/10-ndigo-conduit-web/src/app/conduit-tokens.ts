/**
 * The context tokens this app's beans are registered and looked up under.
 *
 * Every read goes through a token, never a string: the token carries the bean's
 * compile-time type to the call site, so `context.getValue(ARTICLES)` is an
 * `ArticleService` at the type level and a rename cannot silently miss.
 */
import { ContextToken } from '@ndigo/context';
import { DISPATCHER, HANDLER_MAPPING, VIEW_TARGET } from '@ndigo/dispatcher';
import { ROUTER } from '@ndigo/router';
import type { ConduitServices } from './conduit-services';
import type { ConduitApi } from '../lib/api/conduit-types';
import type { ArticleService } from '../services/article-service';
import type { CommentService } from '../services/comment-service';
import type { ProfileService } from '../services/profile-service';
import type { SessionService } from '../services/session-service';
import type { TagService } from '../services/tag-service';

export { DISPATCHER, HANDLER_MAPPING, ROUTER, VIEW_TARGET };

/** The assembled service graph. */
export const CONDUIT_SERVICES = new ContextToken<ConduitServices>('conduitServices');

/** The `ConduitApi` port (the HTTP-backed client in the running app). */
export const CONDUIT_API = new ContextToken<ConduitApi>('conduitApi');

/** The authenticated-session service. */
export const SESSION_SERVICE = new ContextToken<SessionService>('sessionService');

/** The article/feed service. */
export const ARTICLE_SERVICE = new ContextToken<ArticleService>('articleService');

/** The popular-tags service. */
export const TAG_SERVICE = new ContextToken<TagService>('tagService');

/** The profile service. */
export const PROFILE_SERVICE = new ContextToken<ProfileService>('profileService');

/** The comment service. */
export const COMMENT_SERVICE = new ContextToken<CommentService>('commentService');
