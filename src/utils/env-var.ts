class Env {
  static get allowedGroups(): string[] {
    const groups = process.env.GROUPS?.toString().split(',') || [];
    const users = process.env.USERS?.toString().split(',') || [];
    groups.push(...users);

    if (process.env.NODE_ENV === 'development') {
      return process.env.TEST_GROUP?.toString().split(',') || [''];
    }

    return groups;
  }

  static get userPhone(): string {
    return process.env.BOT_PHONE || '';
  }

  static get chromeLocation(): string {
    switch (process.platform) {
      case 'linux':
        return '/usr/bin/google-chrome-stable';

      case 'win32':
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

      default:
        return '/usr/bin/google-chrome-stable';
    }
  }
}

export default Env;
