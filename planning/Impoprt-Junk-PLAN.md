## Goals for PR - written 06-21-2026

### Don't import Junk

1. improve the email default search query - remove senders (eventbright, doordash)
2. skip items that don't fall into a category
3. review the items skipped, option to add them back

### Improve API calls for Gmail

1. cache all the emails, and be careful to to clear it
2. be more obvious about what is an entirely new query and make every effort to use cache/ limit calls
3. more descriptive UI about the date range of emails fetched, etc
