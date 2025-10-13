const makeRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  refresh: jest.fn(),
});
module.exports = {
  useRouter: makeRouter,
  useSearchParams: () => new URLSearchParams('next=%2Faccount'),
};
