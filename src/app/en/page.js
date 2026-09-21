import { LocaleProvider } from '@/i18n/LocaleProvider';
import HomeApp from '@/components/HomeApp';

export default function Page() {
  return (
    <LocaleProvider locale="en">
      <HomeApp />
    </LocaleProvider>
  );
}
