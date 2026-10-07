/**
 * Static-shaped content probes: `/uuid`, `/json`, `/html`, `/xml`,
 * `/robots.txt`.
 * @module blue-httpbin
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { randomUUID } from 'node:crypto';
import { getMapping, requestMapping } from '@blue/dispatcher';
import { HTTPHeaders, ResponseStatuses } from '@blue/http';
import { ResponseEntity } from '@blue/platform-node';

/** The stable sample document served by `GET /json`. */
const SAMPLE_DOCUMENT = {
    slideshow: {
        author: 'Yours Truly',
        date: 'date of publication',
        title: 'Sample Slide Show',
        slides: [
            { title: 'Wake up to WonderWidgets!', type: 'all' },
            {
                items: ['Why <em>WonderWidgets</em> are great', 'Who <em>buys</em> WonderWidgets'],
                title: 'Overview',
                type: 'all',
            },
        ],
    },
};

/** A minimal HTML document served by `GET /html`. */
const SAMPLE_HTML = `<!DOCTYPE html>
<html>
  <head><title>Blue HTTPBin</title></head>
  <body><h1>Hello from Blue HTTPBin</h1><p>A tiny HTML response.</p></body>
</html>
`;

/** A minimal XML document served by `GET /xml`. */
const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<slideshow title="Sample Slide Show" author="Yours Truly">
  <slide type="all">Wake up to WonderWidgets!</slide>
</slideshow>
`;

/**
 * Content probes: constant documents returned under their natural media types,
 * exercising `ResponseEntity` string bodies (rendered raw for non-JSON
 * content types) alongside the default JSON serialization.
 */
@requestMapping('/')
export class ContentController {
    /**
     * GET /uuid — a fresh random UUID.
     */
    @getMapping('/uuid')
    uuid() {
        return { uuid: randomUUID() };
    }

    /**
     * GET /json — a fixed sample JSON document.
     */
    @getMapping('/json')
    json() {
        return SAMPLE_DOCUMENT;
    }

    /**
     * GET /html — a fixed HTML document.
     */
    @getMapping('/html')
    html() {
        return new ResponseEntity(SAMPLE_HTML, ResponseStatuses.OK, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'text/html; charset=utf-8',
        });
    }

    /**
     * GET /xml — a fixed XML document.
     */
    @getMapping('/xml')
    xml() {
        return new ResponseEntity(SAMPLE_XML, ResponseStatuses.OK, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'application/xml; charset=utf-8',
        });
    }

    /**
     * GET /robots.txt — a fixed robots policy.
     */
    @getMapping('/robots.txt')
    robots() {
        return new ResponseEntity('User-agent: *\nDisallow: /deny\n', ResponseStatuses.OK, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'text/plain; charset=utf-8',
        });
    }
}
